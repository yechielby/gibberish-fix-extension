import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import * as path from 'node:path';

/** Maps OS identifiers to our layout names. Extend as needed. */
const OS_TO_LAYOUT: Record<string, string> = {
  // Windows KLIDs (lowercased, last 8 hex of InputMethodTip)
  '0000040d': 'hebrew', '00000409': 'english', '00000401': 'arabic',
  '00000429': 'farsi', '00000419': 'russian', '00000422': 'ukrainian',
  '00000423': 'belarusian', '00000408': 'greek', '00000420': 'urdu',
  // macOS input source IDs
  'com.apple.keylayout.Hebrew': 'hebrew', 'com.apple.keylayout.US': 'english',
  'com.apple.keylayout.Arabic': 'arabic', 'com.apple.keylayout.Persian': 'farsi',
  // Linux xkb codes
  il: 'hebrew', us: 'english', ara: 'arabic', ir: 'farsi', ru: 'russian',
};

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve) => {
    execFile(cmd, args, { windowsHide: true, timeout: 4000 }, (err, stdout) => {
      resolve(err ? '' : stdout);
    });
  });
}

/** Detect installed keyboard languages, mapped to our layout names. */
export async function detectOSLayouts(): Promise<string[]> {
  const found = new Set<string>();
  if (process.platform === 'win32') {
    const out = await run('powershell.exe', [
      '-NoProfile', '-Command',
      '(Get-WinUserLanguageList).InputMethodTips -join "`n"',
    ]);
    for (const tip of out.split(/\r?\n/)) {
      const klid = tip.split(':')[1]?.trim().toLowerCase().slice(-8);
      if (klid && OS_TO_LAYOUT[klid]) found.add(OS_TO_LAYOUT[klid]);
    }
  } else if (process.platform === 'darwin') {
    const out = await run('defaults', [
      'read', 'com.apple.HIToolbox', 'AppleEnabledInputSources',
    ]);
    for (const [id, name] of Object.entries(OS_TO_LAYOUT)) {
      if (out.includes(id)) found.add(name);
    }
  } else {
    const out = await run('setxkbmap', ['-query']);
    const m = out.match(/layout:\s*(.+)/);
    if (m) {
      for (const code of m[1].split(',')) {
        const n = OS_TO_LAYOUT[code.trim()];
        if (n) found.add(n);
      }
    }
  }
  return [...found];
}

/** Switch the OS keyboard (Windows only in V1.0). Fails silently. */
export async function switchOSKeyboard(
  context: vscode.ExtensionContext,
  klidWindows: string,
): Promise<void> {
  if (process.platform !== 'win32') return;
  const script = path.join(context.extensionPath, 'scripts', 'switch-layout.ps1');
  await run('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, klidWindows,
  ]);
}
