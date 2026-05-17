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
