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
  // Languages installed as OS keyboards get a ✓ and sort first: those also
  // get the automatic OS keyboard switch. The rest still convert text fine
  // (the OS switch is just skipped), so they are shown — never hidden.
  const installed = new Set(await detectOSLayouts());
  const langItems: vscode.QuickPickItem[] = [...TARGET_NAMES]
    .sort((a, b) => Number(installed.has(b)) - Number(installed.has(a)))
    .map((n) => ({
      // description stays exactly `n` — it is the layout key used downstream.
      label: installed.has(n)
        ? `$(check) ${LAYOUTS[n].displayName}`
        : LAYOUTS[n].displayName,
      description: n,
      detail: installed.has(n)
        ? 'Installed on this PC — keyboard will switch automatically'
        : undefined,
    }));
  // Identified by reference equality after the pick — no description field so
  // it doesn't clash with layout keys in the QuickPick UI.
  const shortcutsItem: vscode.QuickPickItem = {
    label: '$(gear) Customize keyboard shortcuts…',
    detail: 'Open VS Code Keyboard Shortcuts filtered to GibberishFix',
  };
  const items: vscode.QuickPickItem[] = [
    ...langItems,
    { label: '', kind: vscode.QuickPickItemKind.Separator },
    shortcutsItem,
  ];
  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose GibberishFix target language',
  });
  if (!pick) return;
  if (pick === shortcutsItem) {
    await vscode.commands.executeCommand('gibberish-fix.openKeybindingsSettings');
    return;
  }
  const layoutKey = pick.description;
  if (!layoutKey) return;
  await setPreferredTarget(context.globalState, layoutKey);
  await vscode.workspace
    .getConfiguration('gibberish-fix')
    .update('targetLanguage', layoutKey, true);
  updateStatusBar(LAYOUTS[layoutKey].displayName);
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
    vscode.commands.registerCommand('gibberish-fix.openKeybindingsSettings', () =>
      vscode.commands.executeCommand(
        'workbench.action.openGlobalKeybindings',
        'GibberishFix',
      ),
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
