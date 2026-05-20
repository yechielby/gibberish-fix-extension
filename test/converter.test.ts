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

import { buildBidiMapping } from '../src/converter';

test('buildBidiMapping: mixed gibberish converts each char by its own script', () => {
  const he = getLayout('hebrew')!;
  const map = buildBidiMapping(english, he, true);
  assert.equal(
    convert('vna,bv mrhl kvhu, auuv  ארוק', map),
    'המשתנה צריך להיות שווה  true',
  );
});

test('buildBidiMapping: double spaces are preserved', () => {
  const he = getLayout('hebrew')!;
  const map = buildBidiMapping(english, he, true);
  assert.equal(convert('a  ב', map), 'ש  c');
});

test('buildBidiMapping: pure Latin gibberish still goes to target', () => {
  const he = getLayout('hebrew')!;
  const map = buildBidiMapping(english, he, true);
  assert.equal(convert('tbh rumv kgau,', map), 'אני רוצה לעשות');
});

test('buildBidiMapping: pure target gibberish still goes to English', () => {
  const he = getLayout('hebrew')!;
  const map = buildBidiMapping(english, he, true);
  assert.equal(convert('ארוק', map), 'true');
});

test('generated index exposes ~32 target names', () => {
  const { TARGET_NAMES } = require('../src/layouts/index');
  assert.ok(TARGET_NAMES.length >= 30 && TARGET_NAMES.length <= 32);
});

import { convertBidi } from '../src/converter';

// Anchor test for the user-reported bug: shared ASCII slots (`.` `,` `/` `'`)
// must be resolved by neighbouring-letter context, not statically mapped
// English -> target. Reported by Yitzhak Binyamin (LinkedIn, 2026-05).
test('convertBidi: anchor — `.. יקרק ן,צ פוא ש בםצצקמא` -> `// here i\'m put a comment`', () => {
  const he = getLayout('hebrew')!;
  assert.equal(
    convertBidi('.. יקרק ן,צ פוא ש בםצצקמא', english, he, true),
    "// here i'm put a comment",
  );
});

test('convertBidi: shared `.` after Hebrew word resolves to `/` (he->en)', () => {
  const he = getLayout('hebrew')!;
  // `ארוק.` — Hebrew gibberish then a `.`; backward context = ק (Hebrew),
  // so `.` belongs to the Hebrew side and maps to `/`.
  assert.equal(convertBidi('ארוק.', english, he, true), 'true/');
});

test('convertBidi: shared `.` after Latin word resolves to `ץ` (en->he)', () => {
  const he = getLayout('hebrew')!;
  // `true.` — Latin then `.`; backward context = e (Latin), so `.` belongs
  // to the English side and maps to `ץ` (Hebrew layout `.` position).
  assert.equal(convertBidi('true.', english, he, true), 'ארוקץ');
});

test('convertBidi: shared char at start resolves via forward lookup', () => {
  const he = getLayout('hebrew')!;
  // `.ארוק` — `.` has nothing backward, forward = Hebrew, so `.` -> `/`.
  assert.equal(convertBidi('.ארוק', english, he, true), '/true');
});

test('convertBidi: all-shared input falls back to provided direction', () => {
  const he = getLayout('hebrew')!;
  // No unambiguous letters anywhere; fallback wins. Default (toTarget)
  // preserves prior behaviour of buildBidiMapping for isolated punctuation.
  assert.equal(convertBidi('..', english, he, true), 'ץץ');
  assert.equal(convertBidi('..', english, he, true, 'toEnglish'), '//');
});

test('convertBidi: pure Latin gibberish still converts to target', () => {
  const he = getLayout('hebrew')!;
  assert.equal(
    convertBidi('tbh rumv kgau,', english, he, true),
    'אני רוצה לעשות',
  );
});

test('convertBidi: pure Hebrew gibberish still converts to English', () => {
  const he = getLayout('hebrew')!;
  assert.equal(convertBidi('ארוק', english, he, true), 'true');
});

test('convertBidi: mixed gibberish preserves per-script direction', () => {
  const he = getLayout('hebrew')!;
  // Same anchor as buildBidiMapping mixed test, but routed through convertBidi.
  assert.equal(
    convertBidi('vna,bv mrhl kvhu, auuv  ארוק', english, he, true),
    'המשתנה צריך להיות שווה  true',
  );
});

// Sanity: prove that *real* Hebrew-keyboard typing of code-y strings like
// "here.now" and "'here'" round-trips back through convertBidi. On a real
// Hebrew layout, `.` is reached by the `/` physical key, `'` by the `w` key,
// and the literal `.` / `'` characters are produced by *different* keys —
// so the gibberish produced by real typing of `here.now` is `יקרקץמם'`, not
// `יקרק.מםו`. These tests guard against ever "fixing" that round-trip.
test('convertBidi: real Hebrew typing of `here.now` round-trips', () => {
  const he = getLayout('hebrew')!;
  // `here.now` keys on Hebrew layout produce: י ק ר ק ץ מ ם '
  assert.equal(convertBidi("יקרקץמם'", english, he, true), 'here.now');
});

test("convertBidi: real Hebrew typing of `'here'` round-trips", () => {
  const he = getLayout('hebrew')!;
  // `'here'` keys on Hebrew layout produce: , י ק ר ק ,
  assert.equal(convertBidi(',יקרק,', english, he, true), "'here'");
});
