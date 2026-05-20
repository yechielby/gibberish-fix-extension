/** Split a layout row exactly like simple-keyboard: no trim, no collapse. */
export const splitRow = (row: string): string[] => row.split(' ');

/** A "key" is special if it's an empty slot or a {token}. */
export const isSpecial = (key: string): boolean =>
  key === '' || key.startsWith('{');

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

const inTargetScript = (key: string, target: Layout): boolean => {
  const cp = key.codePointAt(0);
  return (
    cp !== undefined &&
    target.scriptRange.some((rg) => cp >= rg.from && cp <= rg.to)
  );
};

const isLatinLetter = (key: string): boolean => {
  const cp = key.codePointAt(0);
  if (cp === undefined) return false;
  return (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
};

/**
 * Build a single map for auto mode: every character is converted by its own
 * script. Latin / ASCII keys use english -> target; characters in the target
 * script use target -> english. Target-script entries are layered on top of
 * the english->target map but only for keys that are actually in the target
 * script range, so shared ASCII slots (e.g. `,`) stay english->target.
 *
 * NOTE: shared ASCII slots are context-blind here — for context-aware
 * disambiguation of shared punctuation, use `convertBidi` instead. This
 * function is kept for backwards compatibility and simple cases.
 */
export function buildBidiMapping(
  english: Layout,
  target: Layout,
  convertDigits: boolean,
): Map<string, string> {
  const map = buildMapping(english, target, convertDigits);
  for (const [k, v] of buildMapping(target, english, convertDigits)) {
    if (inTargetScript(k, target)) map.set(k, v);
  }
  return map;
}

/**
 * Context-aware bidirectional converter. Shared ASCII slots (`.` `,` `'` `/`
 * etc.) exist in both layouts at *different* physical positions, so they're
 * ambiguous without context. Algorithm, per character:
 *
 *   - Unambiguous (Latin letter / target-script letter): convert by its own
 *     script (same as buildBidiMapping).
 *   - Shared/ambiguous: walk **backward** through prior chars (skipping
 *     other shared/ambiguous ones) until hitting an unambiguous letter — its
 *     script decides the direction. If nothing backward, walk forward.
 *     If neither direction yields an unambiguous letter, use
 *     `fallbackDirection`.
 *
 * Rationale for backward-first: punctuation typically follows the word it
 * belongs to, so the nearest letter behind a `.` / `,` is the strongest
 * signal of its intended language.
 */
export function convertBidi(
  text: string,
  english: Layout,
  target: Layout,
  convertDigits: boolean,
  fallbackDirection: 'toEnglish' | 'toTarget' = 'toTarget',
): string {
  const enToTarget = buildMapping(english, target, convertDigits);
  const targetToEn = buildMapping(target, english, convertDigits);

  // Multi-char ligatures (e.g. Arabic لا) are substituted first against the
  // appropriate direction's map. Apply them as a pre-pass using both maps:
  // since ligature keys are by definition target-script multi-char strings,
  // they only live in the target->english map.
  const targetLigatures = [...targetToEn.entries()].filter(([k]) => k.length > 1);
  for (const [from, to] of targetLigatures) {
    text = text.split(from).join(to);
  }
  // english->target ligatures are unusual but support them symmetrically.
  const enLigatures = [...enToTarget.entries()].filter(([k]) => k.length > 1);
  for (const [from, to] of enLigatures) {
    text = text.split(from).join(to);
  }

  const chars = [...text];

  const directionOf = (ch: string): 'toEnglish' | 'toTarget' | null => {
    if (inTargetScript(ch, target)) return 'toEnglish';
    if (isLatinLetter(ch)) return 'toTarget';
    return null;
  };

  const resolveContext = (index: number): 'toEnglish' | 'toTarget' => {
    for (let i = index - 1; i >= 0; i--) {
      const d = directionOf(chars[i]);
      if (d) return d;
    }
    for (let i = index + 1; i < chars.length; i++) {
      const d = directionOf(chars[i]);
      if (d) return d;
    }
    return fallbackDirection;
  };

  return chars
    .map((ch, i) => {
      const own = directionOf(ch);
      if (own === 'toEnglish') return targetToEn.get(ch) ?? ch;
      if (own === 'toTarget') return enToTarget.get(ch) ?? ch;
      // Ambiguous shared char — resolve by context.
      const dir = resolveContext(i);
      const map = dir === 'toEnglish' ? targetToEn : enToTarget;
      return map.get(ch) ?? ch;
    })
    .join('');
}

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
