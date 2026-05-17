import * as vscode from 'vscode';
import { getLayout } from './layouts/index';
import {
  buildMapping,
  buildBidiMapping,
  convert,
  detectDirection,
} from './converter';
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

  // 2. In a real text editor, a no-selection cut grabs the whole line
  // *including its trailing newline* and deletes the line — pasting that
  // back leaves a spurious blank line. So detect the empty-selection case
  // up front (only possible when a text editor is active; webview/chat
  // inputs have no activeTextEditor and fall through to the heuristic).
  const editor = vscode.window.activeTextEditor;
  const noSelection =
    editor !== undefined && editor.selections.every((s) => s.isEmpty);

  if (noSelection && !settings.selectAllIfNoSelection) return;

  let cut: string;
  if (noSelection) {
    // Select all first, then a single cut — never the line-with-newline cut.
    await vscode.commands.executeCommand('editor.action.selectAll');
    await sleep(50);
    await vscode.commands.executeCommand('editor.action.clipboardCutAction');
    await sleep(80);
    cut = await vscode.env.clipboard.readText();
  } else {
    // 3. cut the selection
    await vscode.commands.executeCommand('editor.action.clipboardCutAction');
    await sleep(80);
    cut = await vscode.env.clipboard.readText();

    // 4. webview/chat with no selection -> select all, cut again
    if (cut === snapshot && settings.selectAllIfNoSelection) {
      await vscode.commands.executeCommand('editor.action.selectAll');
      await sleep(50);
      await vscode.commands.executeCommand('editor.action.clipboardCutAction');
      await sleep(80);
      cut = await vscode.env.clipboard.readText();
    }
  }

  // 5. still nothing -> abort silently
  if (!cut || cut === snapshot) return;

  // 6-7. convert. Auto = per-character bidirectional (each char by its own
  // script). Forced = single direction (convert only the opposite script).
  let converted: string;
  let dir: 'toEnglish' | 'toTarget';
  if (forced === 'auto') {
    const map = buildBidiMapping(english, target, settings.convertDigits);
    converted = convert(cut, map);
    // The mix has no single direction; use the majority only to decide
    // which OS keyboard to switch to afterwards.
    dir = detectDirection(cut, target);
  } else {
    dir = forced;
    const [from, to] =
      dir === 'toEnglish' ? [target, english] : [english, target];
    const map = buildMapping(from, to, settings.convertDigits);
    converted = convert(cut, map);
  }

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
