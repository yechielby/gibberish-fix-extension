import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import * as path from 'node:path';

/** Maps OS identifiers to our layout names. Extend as needed. */
const OS_TO_LAYOUT: Record<string, string> = {
  // Windows LANGIDs (the part BEFORE the colon in an InputMethodTip,
  // e.g. "040D:0002040D" -> langid "040d"). Matching the LANGID rather
  // than the full KLID is robust to keyboard sub-variants.
  '040d': 'hebrew', '0409': 'english', '0401': 'arabic',
  '0429': 'farsi', '0419': 'russian', '0422': 'ukrainian',
  '0423': 'belarusian', '0408': 'greek', '0420': 'urdu',
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
      // tip format: "LANGID:KLID" e.g. "040D:0002040D". The LANGID
      // (before the colon) is the stable language id; the KLID may be
      // a sub-variant (e.g. 0002040D), so match on LANGID.
      const langid = tip.split(':')[0]?.trim().toLowerCase();
      if (langid && OS_TO_LAYOUT[langid]) found.add(OS_TO_LAYOUT[langid]);
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

/** Switch the OS keyboard (Windows only in V0.1.0). Fails silently. */
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
