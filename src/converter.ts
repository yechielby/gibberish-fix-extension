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
