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
