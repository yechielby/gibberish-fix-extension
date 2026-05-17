import * as vscode from 'vscode';

let item: vscode.StatusBarItem | undefined;

export function createStatusBar(): vscode.StatusBarItem {
  item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  item.command = 'gibberish-fix.showMenu';
  item.tooltip = 'GibberishFix: click to choose target language';
  return item;
}

export function updateStatusBar(targetDisplayName: string | undefined): void {
  if (!item) return;
  if (targetDisplayName) {
    item.text = `$(keyboard) ${targetDisplayName}`;
    item.show();
  } else {
    item.hide();
  }
}

export function disposeStatusBar(): void {
  item?.dispose();
  item = undefined;
}
