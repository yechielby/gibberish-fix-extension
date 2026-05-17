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
