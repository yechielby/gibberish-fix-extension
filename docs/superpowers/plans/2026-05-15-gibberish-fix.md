# GibberishFix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone VS Code extension (`gibberish-fix`) that converts text typed in the wrong keyboard layout — in any input including AI-chat webviews — and switches the OS keyboard layout to match, all in one keystroke.

**Architecture:** A clipboard-relay pipeline (cut → detect direction → convert → paste → switch OS keyboard) driven by a registered command/keybinding. Pure conversion logic is unit-tested with Node's built-in test runner. ~32 non-Latin layouts are auto-generated at build time from `simple-keyboard-layouts` using the exact `row.split(" ")` semantics that library uses. OS keyboard switching on Windows uses an inline PowerShell P/Invoke script bundled in the VSIX.

**Tech Stack:** TypeScript (strict, ES2022, Node16 modules), esbuild (single CJS bundle), VS Code API ^1.94.0, `tsx` for running TS tests, `@vscode/vsce` for packaging. Zero runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-05-15-keyboard-layout-fixer-design.md`

**Project location:** `c:\Code\gibberish-fix\` (new directory, NOT a worktree of the current repo)

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Extension manifest: commands, keybindings, settings, scripts |
| `tsconfig.json` | TypeScript strict config |
| `esbuild.mjs` | Bundles `src/extension.ts` → `dist/extension.js` (CJS) |
| `src/layouts/types.ts` | `Layout` interface |
| `src/layouts/english.ts` | Hand-written base/reference layout |
| `src/layouts/<name>.ts` | ~32 auto-generated non-Latin layouts |
| `src/layouts/index.ts` | Auto-generated registry: `LAYOUTS` map + `getLayout()` |
| `src/converter.ts` | Pure functions: `splitRow`, `isSpecial`, `buildMapping`, `convert`, `detectDirection` |
| `src/settings.ts` | Reads workspace config + `globalState` (preferred target learning) |
| `src/osLayout.ts` | OS keyboard-language detection + Windows kb-switch |
| `src/pipeline.ts` | The 11-step convert orchestration |
| `src/statusBar.ts` | `⌨️ <lang>` status bar item |
| `src/extension.ts` | Entry point: activation, command registration, target selection |
| `scripts/import-layouts.mjs` | Build-time generator for the ~32 layouts + index |
| `scripts/switch-layout.ps1` | PowerShell P/Invoke kb-switch (bundled in VSIX) |
| `test/converter.test.ts` | Unit tests for all converter functions + Hebrew integration |

---

## Task 1: Project scaffold

**Files:**
- Create: `c:\Code\gibberish-fix\package.json`
- Create: `c:\Code\gibberish-fix\tsconfig.json`
- Create: `c:\Code\gibberish-fix\esbuild.mjs`
- Create: `c:\Code\gibberish-fix\.gitignore`
- Create: `c:\Code\gibberish-fix\.vscode\launch.json`

- [ ] **Step 1: Create the project directory and init git**

```bash
mkdir -p "c:/Code/gibberish-fix"
cd "c:/Code/gibberish-fix"
git init
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "gibberish-fix",
  "displayName": "GibberishFix",
  "description": "Fix text typed in the wrong keyboard layout (LangOver-style) in any input, including AI chat panels. Auto-switches the OS keyboard.",
  "version": "1.0.0",
  "publisher": "yechielby",
  "license": "MIT",
  "engines": { "vscode": "^1.94.0" },
  "categories": ["Keymaps", "Other"],
  "keywords": [
    "gibberish-fix", "gibberishfix", "gibberish", "langover",
    "keyboard layout", "wrong layout", "hebrew", "arabic",
    "persian", "rtl", "typing fix"
  ],
  "main": "./dist/extension.js",
  "activationEvents": ["onStartupFinished"],
  "contributes": {
    "commands": [],
    "keybindings": [],
    "configuration": { "title": "GibberishFix", "properties": {} }
  },
  "scripts": {
    "gen-layouts": "node scripts/import-layouts.mjs",
    "build": "node esbuild.mjs --production",
    "watch": "node esbuild.mjs --watch",
    "test": "node --import tsx --test test/*.test.ts",
    "package": "npx @vscode/vsce package",
    "vscode:prepublish": "npm run build"
  },
  "devDependencies": {
    "@types/vscode": "^1.94.0",
    "@types/node": "^20.0.0",
    "esbuild": "^0.24.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  },
  "files": ["dist", "scripts/switch-layout.ps1", "README.md", "CHANGELOG.md", "icon.png"]
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": ".",
    "noEmit": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Write `esbuild.mjs`**

```javascript
import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  outfile: 'dist/extension.js',
  external: ['vscode'],
  minify: production,
  sourcemap: !production,
});

if (watch) {
  await ctx.watch();
  console.log('watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('build complete');
}
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
*.vsix
.tmp-layouts/
```

- [ ] **Step 6: Write `.vscode/launch.json`**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
    }
  ]
}
```

- [ ] **Step 7: Install dependencies**

Run: `cd "c:/Code/gibberish-fix" && npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add -A
git commit -m "chore: scaffold gibberish-fix extension project"
```

---

## Task 2: Layout type + English base layout

**Files:**
- Create: `c:\Code\gibberish-fix\src\layouts\types.ts`
- Create: `c:\Code\gibberish-fix\src\layouts\english.ts`

- [ ] **Step 1: Write `src/layouts/types.ts`**

```typescript
export interface Layout {
  /** Unique identifier, also the registry key. */
  name: string;
  /** Display name in the language's own script. */
  displayName: string;
  /** Unicode ranges of characters typical to this script (for direction detection). */
  scriptRange: { from: number; to: number }[];
  /** Windows Keyboard Layout ID (KLID) for OS keyboard switching. */
  klidWindows: string;
  /** 5 rows of keys, raw simple-keyboard format (split with " ", no trim). */
  default: string[];
}
```

- [ ] **Step 2: Write `src/layouts/english.ts`** (verified in POC)

```typescript
import { Layout } from './types';

export const english: Layout = {
  name: 'english',
  displayName: 'English',
  scriptRange: [{ from: 0x0041, to: 0x005a }, { from: 0x0061, to: 0x007a }],
  klidWindows: '00000409',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; ' {enter}",
    "{shift} z x c v b n m , . / {shift}",
    ".com @ {space}",
  ],
};
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/layouts/types.ts src/layouts/english.ts
git commit -m "feat: add Layout interface and English base layout"
```

---

## Task 3: Converter — `splitRow` and `isSpecial`

**Files:**
- Create: `c:\Code\gibberish-fix\src\converter.ts`
- Test: `c:\Code\gibberish-fix\test\converter.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitRow, isSpecial } from '../src/converter';

test('splitRow uses bare split(" ") — leading space yields empty first slot', () => {
  assert.deepEqual(splitRow(' 1 2'), ['', '1', '2']);
});

test('splitRow keeps consecutive spaces as empty slots', () => {
  assert.deepEqual(splitRow('a  b'), ['a', '', 'b']);
});

test('isSpecial: empty string is special', () => {
  assert.equal(isSpecial(''), true);
});

test('isSpecial: {tab} token is special', () => {
  assert.equal(isSpecial('{tab}'), true);
});

test('isSpecial: a normal letter is not special', () => {
  assert.equal(isSpecial('a'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: FAIL — `Cannot find module '../src/converter'`.

- [ ] **Step 3: Write minimal implementation in `src/converter.ts`**

```typescript
/** Split a layout row exactly like simple-keyboard: no trim, no collapse. */
export const splitRow = (row: string): string[] => row.split(' ');

/** A "key" is special if it's an empty slot or a {token}. */
export const isSpecial = (key: string): boolean =>
  key === '' || key.startsWith('{');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/converter.ts test/converter.test.ts
git commit -m "feat: add splitRow and isSpecial with tests"
```

---

## Task 4: Converter — `buildMapping`

**Files:**
- Modify: `c:\Code\gibberish-fix\src\converter.ts`
- Modify: `c:\Code\gibberish-fix\test\converter.test.ts`

- [ ] **Step 1: Add the failing test** (append to `test/converter.test.ts`)

```typescript
import { buildMapping } from '../src/converter';
import { english } from '../src/layouts/english';
import type { Layout } from '../src/layouts/types';

const hebrewForTest: Layout = {
  name: 'hebrew',
  displayName: 'עברית',
  scriptRange: [{ from: 0x0590, to: 0x05ff }],
  klidWindows: '0000040d',
  default: [
    " 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} / ' ק ר א ט ו ן ם פ ] [ \\",
    "{lock} ש ד ג כ ע י ח ל ך ף , {enter}",
    "{shift} ז ס ב ה נ מ צ ת ץ . {shift}",
    ".com @ {space}",
  ],
};

test('buildMapping maps English letter positions to Hebrew', () => {
  const map = buildMapping(english, hebrewForTest, true);
  assert.equal(map.get('t'), 'א');
  assert.equal(map.get('a'), 'ש');
  assert.equal(map.get('k'), 'ל');
});

test('buildMapping skips special keys', () => {
  const map = buildMapping(english, hebrewForTest, true);
  assert.equal(map.has('{tab}'), false);
  assert.equal(map.has(''), false);
});

test('buildMapping skips digits when convertDigits is false', () => {
  const map = buildMapping(english, hebrewForTest, false);
  assert.equal(map.has('1'), false);
});

test('buildMapping includes digits when convertDigits is true', () => {
  const map = buildMapping(english, hebrewForTest, true);
  // Hebrew row 1 position 1 is "1" (English position 1 is also "1") -> no-op entry exists
  assert.equal(map.get('1'), '1');
});

test('buildMapping uses min length for graceful degradation', () => {
  const shortLayout: Layout = {
    ...hebrewForTest,
    default: ["{tab} ק", "{tab}", "{tab}", "{tab}", ".com"],
  };
  const map = buildMapping(english, shortLayout, true);
  // Only english row 0 pos 1 ("1") vs short "ק" — but english row 0 is numbers;
  // ensure no crash and map is a Map
  assert.ok(map instanceof Map);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: FAIL — `buildMapping is not exported`.

- [ ] **Step 3: Add `buildMapping` to `src/converter.ts`**

```typescript
import type { Layout } from './layouts/types';

const isDigit = (key: string): boolean => /^\d$/.test(key);

/**
 * Build a position-by-position character map from `from` layout to `to` layout.
 * Uses min(row lengths) so unaligned edge keys degrade gracefully (pass-through).
 */
export function buildMapping(
  from: Layout,
  to: Layout,
  convertDigits: boolean,
): Map<string, string> {
  const map = new Map<string, string>();
  for (let r = 0; r < from.default.length; r++) {
    const f = splitRow(from.default[r]);
    const t = splitRow(to.default[r] ?? '');
    const n = Math.min(f.length, t.length);
    for (let i = 0; i < n; i++) {
      const fk = f[i];
      const tk = t[i];
      if (isSpecial(fk) || isSpecial(tk)) continue;
      if (!convertDigits && isDigit(fk)) continue;
      map.set(fk, tk);
    }
  }
  return map;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: PASS — all converter tests passing.

- [ ] **Step 5: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/converter.ts test/converter.test.ts
git commit -m "feat: add buildMapping with graceful degradation"
```

---

## Task 5: Converter — `convert` (with ligature support)

**Files:**
- Modify: `c:\Code\gibberish-fix\src\converter.ts`
- Modify: `c:\Code\gibberish-fix\test\converter.test.ts`

- [ ] **Step 1: Add the failing test** (append to `test/converter.test.ts`)

```typescript
import { convert } from '../src/converter';

test('convert: Hebrew gibberish to intended English-position text', () => {
  const map = buildMapping(hebrewForTest, english, true);
  assert.equal(convert('ארוק', map), 'true');
});

test('convert: English-position gibberish to Hebrew', () => {
  const map = buildMapping(english, hebrewForTest, true);
  assert.equal(convert('tbh rumv kgau,', map), 'אני רוצה לעשות');
});

test('convert: unmapped characters pass through unchanged', () => {
  const map = buildMapping(english, hebrewForTest, true);
  assert.equal(convert('\n', map), '\n');
});

test('convert: multi-char ligature keys are replaced before single chars', () => {
  const map = new Map<string, string>([['لا', 'v'], ['ا', 'h']]);
  // "لا" must become "v", not "h"+"h"
  assert.equal(convert('لا', map), 'v');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: FAIL — `convert is not exported`.

- [ ] **Step 3: Add `convert` to `src/converter.ts`**

```typescript
/**
 * Convert text using a key map. Multi-character keys (e.g. Arabic لا
 * ligature) are substituted first, then remaining single chars.
 */
export function convert(text: string, map: Map<string, string>): string {
  const ligatures = [...map.entries()].filter(([k]) => k.length > 1);
  for (const [from, to] of ligatures) {
    text = text.split(from).join(to);
  }
  return [...text].map((ch) => map.get(ch) ?? ch).join('');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: PASS — including the two real-world POC examples.

- [ ] **Step 5: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/converter.ts test/converter.test.ts
git commit -m "feat: add convert with ligature handling"
```

---

## Task 6: Converter — `detectDirection`

**Files:**
- Modify: `c:\Code\gibberish-fix\src\converter.ts`
- Modify: `c:\Code\gibberish-fix\test\converter.test.ts`

- [ ] **Step 1: Add the failing test** (append to `test/converter.test.ts`)

```typescript
import { detectDirection } from '../src/converter';

test('detectDirection: mostly Hebrew text -> toEnglish', () => {
  assert.equal(detectDirection('שלום עולם', hebrewForTest), 'toEnglish');
});

test('detectDirection: mostly Latin text -> toTarget', () => {
  assert.equal(detectDirection('hello world', hebrewForTest), 'toTarget');
});

test('detectDirection: ties go to toTarget', () => {
  assert.equal(detectDirection('', hebrewForTest), 'toTarget');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: FAIL — `detectDirection is not exported`.

- [ ] **Step 3: Add `detectDirection` to `src/converter.ts`**

```typescript
/**
 * Decide conversion direction by majority vote:
 * more target-script chars -> convert back to English, else -> to target.
 */
export function detectDirection(
  text: string,
  target: Layout,
): 'toEnglish' | 'toTarget' {
  let tgt = 0;
  let lat = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (target.scriptRange.some((rg) => cp >= rg.from && cp <= rg.to)) {
      tgt++;
    } else if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) {
      lat++;
    }
  }
  return tgt > lat ? 'toEnglish' : 'toTarget';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: PASS — all converter unit tests green.

- [ ] **Step 5: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/converter.ts test/converter.test.ts
git commit -m "feat: add detectDirection"
```

---

## Task 7: Layout generator script

**Files:**
- Create: `c:\Code\gibberish-fix\scripts\import-layouts.mjs`

- [ ] **Step 1: Write `scripts/import-layouts.mjs`**

```javascript
// Generates src/layouts/<name>.ts for ~32 non-Latin languages from
// simple-keyboard-layouts, using the exact split(" ") semantics.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = path.join(os.tmpdir(), 'skl-gen');
const REPO = 'https://github.com/simple-keyboard/simple-keyboard-layouts.git';

// name -> { displayName, scriptRange, klidWindows }
const TARGETS = {
  arabic:        { dn: 'العربية',    sr: [[0x0600,0x06ff],[0xfb50,0xfdff],[0xfe70,0xfeff]], klid: '00000401' },
  balochi:       { dn: 'بلۏچی',      sr: [[0x0600,0x06ff]], klid: '00000401' },
  farsi:         { dn: 'فارسی',      sr: [[0x0600,0x06ff]], klid: '00000429' },
  gilaki:        { dn: 'گیلکی',      sr: [[0x0600,0x06ff]], klid: '00000429' },
  kurdish:       { dn: 'کوردی',      sr: [[0x0600,0x06ff]], klid: '00000492' },
  sindhi:        { dn: 'سنڌي',       sr: [[0x0600,0x06ff]], klid: '00000859' },
  urdu:          { dn: 'اردو',       sr: [[0x0600,0x06ff]], klid: '00000420' },
  urduStandard:  { dn: 'اردو',       sr: [[0x0600,0x06ff]], klid: '00000420' },
  uyghur:        { dn: 'ئۇيغۇرچە',   sr: [[0x0600,0x06ff]], klid: '00000480' },
  belarusian:    { dn: 'Беларуская', sr: [[0x0400,0x04ff]], klid: '00000423' },
  macedonian:    { dn: 'Македонски', sr: [[0x0400,0x04ff]], klid: '0000042f' },
  russian:       { dn: 'Русский',    sr: [[0x0400,0x04ff]], klid: '00000419' },
  russianOld:    { dn: 'Русскiй',    sr: [[0x0400,0x04ff]], klid: '00000419' },
  ukrainian:     { dn: 'Українська', sr: [[0x0400,0x04ff]], klid: '00000422' },
  assamese:      { dn: 'অসমীয়া',    sr: [[0x0980,0x09ff]], klid: '0000044d' },
  bengali:       { dn: 'বাংলা',      sr: [[0x0980,0x09ff]], klid: '00000445' },
  hindi:         { dn: 'हिन्दी',     sr: [[0x0900,0x097f]], klid: '00000439' },
  kannada:       { dn: 'ಕನ್ನಡ',     sr: [[0x0c80,0x0cff]], klid: '0000044b' },
  malayalam:     { dn: 'മലയാളം',    sr: [[0x0d00,0x0d7f]], klid: '0000044c' },
  odia:          { dn: 'ଓଡ଼ିଆ',     sr: [[0x0b00,0x0b7f]], klid: '00000448' },
  punjabi:       { dn: 'ਪੰਜਾਬੀ',    sr: [[0x0a00,0x0a7f]], klid: '00000446' },
  telugu:        { dn: 'తెలుగు',    sr: [[0x0c00,0x0c7f]], klid: '0000044a' },
  armenianEastern:{ dn: 'Հայերեն',  sr: [[0x0530,0x058f]], klid: '0000042b' },
  armenianWestern:{ dn: 'Հայերեն',  sr: [[0x0530,0x058f]], klid: '0000042b' },
  japanese:      { dn: '日本語',      sr: [[0x3040,0x30ff]], klid: '00000411' },
  korean:        { dn: '한국어',      sr: [[0x1100,0x11ff],[0x3130,0x318f],[0xac00,0xd7af]], klid: '00000412' },
  hebrew:        { dn: 'עברית',      sr: [[0x0590,0x05ff]], klid: '0000040d' },
  greek:         { dn: 'Ελληνικά',  sr: [[0x0370,0x03ff]], klid: '00000408' },
  thai:          { dn: 'ไทย',        sr: [[0x0e00,0x0e7f]], klid: '0000041e' },
  burmese:       { dn: 'မြန်မာ',     sr: [[0x1000,0x109f]], klid: '00000455' },
  georgian:      { dn: 'ქართული',   sr: [[0x10a0,0x10ff]], klid: '00000437' },
  nko:           { dn: 'ߒߞߏ',       sr: [[0x07c0,0x07ff]], klid: '00000409' },
};

function extractDefault(src) {
  const startIdx = src.search(/default:\s*\[/);
  const arrayStart = src.indexOf('[', startIdx);
  let depth = 0, inString = null, i = arrayStart;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inString) {
      if (c === '\\') { i++; continue; }
      if (c === inString) inString = null;
      continue;
    }
    if (c === '"' || c === "'") { inString = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) break; }
  }
  const body = src.slice(arrayStart + 1, i);
  const rows = [];
  const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    let raw = m[1] !== undefined ? m[1] : m[2];
    raw = raw.replace(/\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
    raw = raw.replace(/\\\\/g, '\\').replace(/\\'/g, "'").replace(/\\"/g, '"');
    rows.push(raw);
  }
  return rows;
}

function coverage(rows, enRows) {
  const split = (r) => (r ?? '').split(' ');
  const special = (k) => k === '' || k.startsWith('{');
  let ok = 0, total = 0;
  for (const r of [1, 2, 3]) {
    const en = split(enRows[r]), tg = split(rows[r]);
    for (let i = 0; i < en.length; i++) {
      if (special(en[i]) || /^\d$/.test(en[i])) continue;
      total++;
      if (tg[i] !== undefined && !special(tg[i])) ok++;
    }
  }
  return total ? Math.round((ok / total) * 100) : 0;
}

// 1. Clone
fs.rmSync(TMP, { recursive: true, force: true });
execSync(`git clone --depth 1 ${REPO} "${TMP}"`, { stdio: 'inherit' });
const LDIR = path.join(TMP, 'src', 'lib', 'layouts');

// 2. English baseline (for coverage report only)
const enRows = extractDefault(fs.readFileSync(path.join(LDIR, 'english.ts'), 'utf8'));

// 3. Generate each target
const OUT = path.join(process.cwd(), 'src', 'layouts');
const report = ['# Layout Coverage Report\n', '| Language | Coverage |', '|---|---|'];
const names = [];

for (const [name, meta] of Object.entries(TARGETS)) {
  const file = path.join(LDIR, `${name}.ts`);
  if (!fs.existsSync(file)) { console.warn(`SKIP missing: ${name}`); continue; }
  const rows = extractDefault(fs.readFileSync(file, 'utf8'));
  const pct = coverage(rows, enRows);
  report.push(`| ${name} (${meta.dn}) | ${pct}% |`);
  names.push(name);

  const srLiteral = meta.sr.map(([a, b]) =>
    `{ from: 0x${a.toString(16)}, to: 0x${b.toString(16)} }`).join(', ');
  const rowsLiteral = rows.map((r) => JSON.stringify(r)).join(',\n    ');

  const ts = `import { Layout } from './types';

export const ${name}: Layout = {
  name: '${name}',
  displayName: ${JSON.stringify(meta.dn)},
  scriptRange: [${srLiteral}],
  klidWindows: '${meta.klid}',
  default: [
    ${rowsLiteral},
  ],
};
`;
  fs.writeFileSync(path.join(OUT, `${name}.ts`), ts, 'utf8');
}

// 4. index.ts
const imports = ["import { Layout } from './types';", "import { english } from './english';"]
  .concat(names.map((n) => `import { ${n} } from './${n}';`))
  .join('\n');
const entries = ['english', ...names].map((n) => `  ${n},`).join('\n');
const indexTs = `${imports}

export const LAYOUTS: Record<string, Layout> = {
${entries}
};

export function getLayout(name: string): Layout | undefined {
  return LAYOUTS[name];
}

export const TARGET_NAMES: string[] = [${names.map((n) => `'${n}'`).join(', ')}];
`;
fs.writeFileSync(path.join(OUT, 'index.ts'), indexTs, 'utf8');

// 5. coverage report
fs.writeFileSync(path.join(OUT, 'coverage-report.md'), report.join('\n') + '\n', 'utf8');

console.log(`Generated ${names.length} layouts + index.ts`);
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add scripts/import-layouts.mjs
git commit -m "feat: add build-time layout generator script"
```

---

## Task 8: Generate layouts and verify Hebrew integration

**Files:**
- Create (generated): `c:\Code\gibberish-fix\src\layouts\*.ts`, `index.ts`, `coverage-report.md`
- Modify: `c:\Code\gibberish-fix\test\converter.test.ts`

- [ ] **Step 1: Run the generator**

Run: `cd "c:/Code/gibberish-fix" && npm run gen-layouts`
Expected: `Generated 32 layouts + index.ts`. Files appear under `src/layouts/`.

- [ ] **Step 2: Add an integration test against the GENERATED hebrew layout**

Append to `test/converter.test.ts`:

```typescript
import { getLayout } from '../src/layouts/index';

test('generated Hebrew layout: tbh rumv kgau, -> אני רוצה לעשות', () => {
  const he = getLayout('hebrew');
  assert.ok(he, 'hebrew layout must exist');
  const map = buildMapping(english, he!, true);
  assert.equal(convert('tbh rumv kgau,', map), 'אני רוצה לעשות');
});

test('generated Hebrew layout: ארוק -> true (reverse)', () => {
  const he = getLayout('hebrew')!;
  const map = buildMapping(he, english, true);
  assert.equal(convert('ארוק', map), 'true');
});

test('generated index exposes ~32 target names', () => {
  const { TARGET_NAMES } = require('../src/layouts/index');
  assert.ok(TARGET_NAMES.length >= 30 && TARGET_NAMES.length <= 32);
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: PASS — generated Hebrew reproduces the POC-verified conversions. If FAIL on the `tbh rumv kgau,` test, the generator's `extractDefault` produced wrong rows — debug the script, do NOT hand-edit generated files.

- [ ] **Step 4: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/layouts test/converter.test.ts
git commit -m "feat: generate 32 non-Latin layouts; verify Hebrew integration"
```

---

## Task 9: Settings module

**Files:**
- Create: `c:\Code\gibberish-fix\src\settings.ts`

- [ ] **Step 1: Write `src/settings.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `cd "c:/Code/gibberish-fix" && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/settings.ts
git commit -m "feat: add settings module with globalState target learning"
```

---

## Task 10: PowerShell keyboard-switch script

**Files:**
- Create: `c:\Code\gibberish-fix\scripts\switch-layout.ps1`

This script is the POC-verified version (5 iterations, confirmed working in editor and Claude Code webview).

- [ ] **Step 1: Write `scripts/switch-layout.ps1`**

```powershell
# Switches the OS keyboard layout for the FOREGROUND window (Windows).
# Usage: powershell -ExecutionPolicy Bypass -File switch-layout.ps1 <KLID>
param(
    [string]$KLID = "00000409"
)

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class KbSwitch {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern IntPtr LoadKeyboardLayout(string pwszKLID, uint Flags);
    [DllImport("user32.dll")]
    public static extern IntPtr PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
"@

$hwnd = [KbSwitch]::GetForegroundWindow()
$hkl = [KbSwitch]::LoadKeyboardLayout($KLID, 1)  # KLF_ACTIVATE
$WM_INPUTLANGCHANGEREQUEST = 0x0050
$res = [KbSwitch]::PostMessage($hwnd, $WM_INPUTLANGCHANGEREQUEST, [IntPtr]::Zero, $hkl)

Write-Output "STATUS=sent KLID=$KLID RESULT=$res"
```

- [ ] **Step 2: Smoke-test the script directly**

Run: `cd "c:/Code/gibberish-fix" && powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/switch-layout.ps1 00000409`
Expected: Output `STATUS=sent KLID=00000409 RESULT=1`.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add scripts/switch-layout.ps1
git commit -m "feat: add Windows keyboard-switch PowerShell script"
```

---

## Task 11: OS layout module

**Files:**
- Create: `c:\Code\gibberish-fix\src\osLayout.ts`

- [ ] **Step 1: Write `src/osLayout.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `cd "c:/Code/gibberish-fix" && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/osLayout.ts
git commit -m "feat: add OS layout detection and Windows kb-switch"
```

---

## Task 12: Pipeline module

**Files:**
- Create: `c:\Code\gibberish-fix\src\pipeline.ts`

- [ ] **Step 1: Write `src/pipeline.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `cd "c:/Code/gibberish-fix" && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/pipeline.ts
git commit -m "feat: add 11-step convert pipeline"
```

---

## Task 13: Status bar module

**Files:**
- Create: `c:\Code\gibberish-fix\src\statusBar.ts`

- [ ] **Step 1: Write `src/statusBar.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `cd "c:/Code/gibberish-fix" && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/statusBar.ts
git commit -m "feat: add status bar item"
```

---

## Task 14: Extension entry point

**Files:**
- Create: `c:\Code\gibberish-fix\src\extension.ts`

- [ ] **Step 1: Write `src/extension.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `cd "c:/Code/gibberish-fix" && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add src/extension.ts
git commit -m "feat: add extension entry point with target resolution"
```

---

## Task 15: Wire up package.json contributions

**Files:**
- Modify: `c:\Code\gibberish-fix\package.json` (the `contributes` block)

- [ ] **Step 1: Replace the `contributes` block in `package.json`**

```json
  "contributes": {
    "commands": [
      { "command": "gibberish-fix.convert", "title": "GibberishFix: Convert (auto)" },
      { "command": "gibberish-fix.convertToEnglish", "title": "GibberishFix: Convert to English" },
      { "command": "gibberish-fix.convertToTarget", "title": "GibberishFix: Convert to Target Language" },
      { "command": "gibberish-fix.showMenu", "title": "GibberishFix: Choose Target Language" }
    ],
    "keybindings": [
      { "command": "gibberish-fix.convert", "key": "alt+shift+l" },
      { "command": "gibberish-fix.convertToEnglish", "key": "alt+shift+e" },
      { "command": "gibberish-fix.convertToTarget", "key": "alt+shift+t" }
    ],
    "configuration": {
      "title": "GibberishFix",
      "properties": {
        "gibberish-fix.targetLanguage": {
          "type": "string",
          "default": "auto",
          "markdownDescription": "Target language. `auto` = detect from installed OS keyboards. Otherwise a layout name (e.g. `hebrew`, `arabic`, `farsi`)."
        },
        "gibberish-fix.switchOSKeyboard": {
          "type": "boolean",
          "default": true,
          "markdownDescription": "After converting, switch the OS keyboard layout to match (Windows only in this version)."
        },
        "gibberish-fix.convertDigits": {
          "type": "boolean",
          "default": true,
          "markdownDescription": "Convert digits too. Critical for Farsi/Bengali (native digits); a no-op for Hebrew/Arabic."
        },
        "gibberish-fix.selectAllIfNoSelection": {
          "type": "boolean",
          "default": true,
          "markdownDescription": "If no text is selected, select all text in the input and convert it."
        }
      }
    }
  },
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cd "c:/Code/gibberish-fix" && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
cd "c:/Code/gibberish-fix"
git add package.json
git commit -m "feat: wire commands, keybindings, and settings in manifest"
```

---

## Task 16: Build, manual smoke test, and package

**Files:**
- Create: `c:\Code\gibberish-fix\README.md`
- Create: `c:\Code\gibberish-fix\CHANGELOG.md`
- Create: `c:\Code\gibberish-fix\icon.png` (copy from an existing RTL extension)

- [ ] **Step 1: Production build**

Run: `cd "c:/Code/gibberish-fix" && npm run build`
Expected: `build complete`, `dist/extension.js` exists.

- [ ] **Step 2: Full test suite**

Run: `cd "c:/Code/gibberish-fix" && npm test`
Expected: All converter + integration tests PASS.

- [ ] **Step 3: Manual smoke test in Extension Development Host**

1. Open `c:\Code\gibberish-fix` in VS Code, press `F5`.
2. In the new window, open a `.txt` file, type `ארוק`, select it, press `Alt+Shift+L`.
   Expected: becomes `true`; on Windows the keyboard switches to English.
3. Open the Claude Code chat input, type `tbh rumv kgau,`, select it, press `Alt+Shift+L`.
   Expected: becomes `אני רוצה לעשות`; keyboard switches to Hebrew.
4. With nothing selected in a `.txt` containing `ארוק`, press `Alt+Shift+L`.
   Expected: select-all fallback converts the whole buffer.

Record PASS/FAIL for each. If any FAIL, fix the relevant module and re-run from Step 1.

- [ ] **Step 4: Write `README.md`** (English primary, Hebrew section)

```markdown
# GibberishFix

Fix text typed in the wrong keyboard layout — LangOver-style — in **any**
VS Code input, including AI chat panels (Claude Code, Copilot, Cursor AI,
Antigravity, Gemini), the editor, search boxes, and the terminal. One
keystroke converts the text **and** switches your OS keyboard to match
(Windows), so you never lose your train of thought.

## Usage

Select gibberish text and press **`Alt+Shift+L`** (auto-detect direction).
Forced direction: `Alt+Shift+E` (to English), `Alt+Shift+T` (to target).
No selection? It converts the whole input. Rebind any shortcut via
VS Code → Keyboard Shortcuts → search "GibberishFix".

## Settings

- `gibberish-fix.targetLanguage` (default `auto`)
- `gibberish-fix.switchOSKeyboard` (default `true`, Windows)
- `gibberish-fix.convertDigits` (default `true`)
- `gibberish-fix.selectAllIfNoSelection` (default `true`)

Supports ~32 non-Latin scripts (Hebrew, Arabic, Farsi, Russian, Greek,
Bengali, Japanese, Korean, and more), auto-generated from
[simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts).

Related: the [Claude Code RTL](https://marketplace.visualstudio.com/publishers/yechielby)
extensions add RTL display support — GibberishFix is a separate, complementary tool.

---

## עברית

תיקון טקסט שהוקלד ב-keyboard layout שגוי, בסגנון LangOver, **בכל** שדה
קלט ב-VS Code כולל צ'אטים של AI. לחיצה אחת ממירה את הטקסט **וגם** מחליפה
את שפת המקלדת של מערכת ההפעלה (Windows) - בלי לקטוע את חוט המחשבה.

בחר טקסט ולחץ **`Alt+Shift+L`**. ללא בחירה - ממיר את כל הקלט.
```

- [ ] **Step 5: Write `CHANGELOG.md`**

```markdown
# Changelog

## 1.0.0

- Initial release.
- Convert text typed in the wrong keyboard layout in any VS Code input,
  including AI chat webviews.
- ~32 non-Latin layouts auto-generated from simple-keyboard-layouts.
- Auto-detect conversion direction; forced-direction commands.
- Select-all fallback when no selection.
- Silent OS keyboard-language detection (zero permissions).
- Automatic OS keyboard switch after conversion (Windows).
- Configurable digits conversion and keybindings.
```

- [ ] **Step 6: Add an icon**

Run: `cp "c:/Code/claude-code-rtl-extension/claude-code-rtl-logo.png" "c:/Code/gibberish-fix/icon.png"`
Expected: `icon.png` exists. Add `"icon": "icon.png"` to `package.json` root.

- [ ] **Step 7: Package the VSIX**

Run: `cd "c:/Code/gibberish-fix" && npm run package`
Expected: `gibberish-fix-1.0.0.vsix` created (~60KB).

- [ ] **Step 8: Final commit**

```bash
cd "c:/Code/gibberish-fix"
git add README.md CHANGELOG.md icon.png package.json
git commit -m "docs: add README, CHANGELOG, icon; package v1.0.0"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §4.1 clipboard cut/paste in webviews | Task 12 (pipeline), Task 16 §3 (smoke) |
| §4.2 select-all fallback | Task 12 step 4 |
| §4.3 OS detection silent | Task 11 `detectOSLayouts` |
| §4.4 Windows kb-switch | Task 10, Task 11 `switchOSKeyboard` |
| §4.6 correct `split(" ")` | Task 3 `splitRow`, Task 7 generator |
| §6 layout generation | Task 7, Task 8 |
| §7 Layout model | Task 2 |
| §8 conversion algorithm | Tasks 3–6 |
| §9 detection & target selection | Task 14 `resolveTarget` |
| §10 commands/keybindings/settings/status bar | Tasks 13, 14, 15 |
| §11 edge cases (ligature, digits, empty, readonly) | Tasks 5, 4, 12 |
| §12 build/package + Marketplace identity | Tasks 1, 16 |

No gaps.

**2. Placeholder scan:** No TBD/TODO; all code blocks complete; generated-file contents are produced by the fully-specified generator in Task 7, verified by Task 8's integration test.

**3. Type consistency:** `Layout` (Task 2) used identically in Tasks 4–14. `buildMapping(from,to,convertDigits)` signature consistent across Tasks 4, 5, 8, 12. `getLayout`/`LAYOUTS`/`TARGET_NAMES` defined by generator (Task 7) and consumed in Tasks 8, 12, 14. `runPipeline(context, resolveTarget, forced)` consistent between Tasks 12 and 14. `switchOSKeyboard(context, klid)` consistent between Tasks 11 and 12.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-15-gibberish-fix.md`.
