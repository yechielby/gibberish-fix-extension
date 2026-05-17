/** Split a layout row exactly like simple-keyboard: no trim, no collapse. */
export const splitRow = (row: string): string[] => row.split(' ');

/** A "key" is special if it's an empty slot or a {token}. */
export const isSpecial = (key: string): boolean =>
  key === '' || key.startsWith('{');
