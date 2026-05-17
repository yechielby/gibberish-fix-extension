import * as vscode from 'vscode';
import { getLayout, LAYOUTS, TARGET_NAMES } from './layouts/index';
import { runPipeline, ForcedDirection } from './pipeline';
import { getSettings, getPreferredTarget, setPreferredTarget } from './settings';
import { detectOSLayouts } from './osLayout';
import { createStatusBar, updateStatusBar, disposeStatusBar } from './statusBar';
import type { Layout } from './layouts/types';

let detectedNonEnglish: string[] = [];

function resolveTarget(context: vscode.ExtensionContext): Layout | undefined {
  const { targetLanguage } = getSettings();
  if (targetLanguage !== 'auto') return getLayout(targetLanguage);

  if (detectedNonEnglish.length === 1) return getLayout(detectedNonEnglish[0]);
  if (detectedNonEnglish.length >= 2) {
    const pref = getPreferredTarget(context.globalState);
    if (pref && detectedNonEnglish.includes(pref)) return getLayout(pref);
    return getLayout(detectedNonEnglish[0]);
  }
  return undefined;
}

async function showMenu(context: vscode.ExtensionContext): Promise<void> {
  const items = TARGET_NAMES.map((n) => ({
    label: LAYOUTS[n].displayName,
    description: n,
  }));
  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose GibberishFix target language',
  });
  if (pick) {
    await setPreferredTarget(context.globalState, pick.description);
    await vscode.workspace
      .getConfiguration('gibberish-fix')
      .update('targetLanguage', pick.description, true);
    updateStatusBar(LAYOUTS[pick.description].displayName);
  }
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  const register = (id: string, dir: ForcedDirection) =>
    vscode.commands.registerCommand(id, () =>
      runPipeline(context, () => resolveTarget(context), dir).catch((e) =>
        console.error('GibberishFix pipeline error:', e),
      ),
    );

  context.subscriptions.push(
    register('gibberish-fix.convert', 'auto'),
    register('gibberish-fix.convertToEnglish', 'toEnglish'),
    register('gibberish-fix.convertToTarget', 'toTarget'),
    vscode.commands.registerCommand('gibberish-fix.showMenu', () =>
      showMenu(context),
    ),
  );

  // Silent OS detection + target resolution
  try {
    const detected = await detectOSLayouts();
    detectedNonEnglish = detected.filter(
      (n) => n !== 'english' && n in LAYOUTS,
    );
  } catch (e) {
    console.error('GibberishFix detection failed:', e);
  }

  const target = resolveTarget(context);
  updateStatusBar(target?.displayName);
}

export function deactivate(): void {
  disposeStatusBar();
}
