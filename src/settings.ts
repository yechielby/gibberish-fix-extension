import * as vscode from 'vscode';

const NS = 'gibberish-fix';
const PREFERRED_TARGET_KEY = 'preferredTarget';

export interface GibberishSettings {
  targetLanguage: string;       // 'auto' or a layout name
  switchOSKeyboard: boolean;
  convertDigits: boolean;
  selectAllIfNoSelection: boolean;
}

export function getSettings(): GibberishSettings {
  const cfg = vscode.workspace.getConfiguration(NS);
  return {
    targetLanguage: cfg.get<string>('targetLanguage', 'auto'),
    switchOSKeyboard: cfg.get<boolean>('switchOSKeyboard', true),
    convertDigits: cfg.get<boolean>('convertDigits', true),
    selectAllIfNoSelection: cfg.get<boolean>('selectAllIfNoSelection', true),
  };
}

export function getPreferredTarget(state: vscode.Memento): string | undefined {
  return state.get<string>(PREFERRED_TARGET_KEY);
}

export async function setPreferredTarget(
  state: vscode.Memento,
  name: string,
): Promise<void> {
  await state.update(PREFERRED_TARGET_KEY, name);
}
