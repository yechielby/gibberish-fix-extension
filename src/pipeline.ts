import * as vscode from 'vscode';
import { getLayout } from './layouts/index';
import { buildMapping, convert, detectDirection } from './converter';
import { getSettings, setPreferredTarget } from './settings';
import { switchOSKeyboard } from './osLayout';
import type { Layout } from './layouts/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ForcedDirection = 'auto' | 'toEnglish' | 'toTarget';

/**
 * The 11-step convert pipeline. `resolveTarget` returns the active target
 * Layout (or undefined if none configured/detected).
 */
export async function runPipeline(
  context: vscode.ExtensionContext,
  resolveTarget: () => Layout | undefined,
  forced: ForcedDirection,
): Promise<void> {
  const target = resolveTarget();
  if (!target) {
    vscode.window.showInformationMessage(
      'GibberishFix: no target language configured or detected.',
    );
    return;
  }
  const english = getLayout('english')!;
  const settings = getSettings();

  // 1. snapshot
  const snapshot = await vscode.env.clipboard.readText();

  // 2-3. cut
  await vscode.commands.executeCommand('editor.action.clipboardCutAction');
  await sleep(80);
  let cut = await vscode.env.clipboard.readText();

  // 4. no selection -> select all, cut again
  if (cut === snapshot && settings.selectAllIfNoSelection) {
    await vscode.commands.executeCommand('editor.action.selectAll');
    await sleep(50);
    await vscode.commands.executeCommand('editor.action.clipboardCutAction');
    await sleep(80);
    cut = await vscode.env.clipboard.readText();
  }

  // 5. still nothing -> abort silently
  if (!cut || cut === snapshot) return;

  // 6. direction
  const dir =
    forced === 'auto' ? detectDirection(cut, target) : forced;

  // 7. convert
  const [from, to] =
    dir === 'toEnglish' ? [target, english] : [english, target];
  const map = buildMapping(from, to, settings.convertDigits);
  const converted = convert(cut, map);

  // 8-9. write + paste
  await vscode.env.clipboard.writeText(converted);
  await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

  // 10. switch OS keyboard to match new direction
  if (settings.switchOSKeyboard) {
    const klid = dir === 'toEnglish' ? english.klidWindows : target.klidWindows;
    await switchOSKeyboard(context, klid);
  }

  // 11. learn preferred target
  await setPreferredTarget(context.globalState, target.name);
}
