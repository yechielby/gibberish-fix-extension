import { Layout } from './types';

export const malayalam: Layout = {
  name: 'malayalam',
  displayName: "മലയാളം",
  scriptRange: [{ from: 0xd00, to: 0xd7f }],
  klidWindows: '0000044c',
  default: [
    "ഒ ൧ ൨ ൩ ൪ ൫ ൬ ൭ ൮ ൯ ൦ - ഋ {bksp}",
    "{tab} ഔ ഐ ആ ഈ ഊ ഭ ങ ഘ ധ ഝ ഢ ഞ \\",
    "{lock} ഓ ഏ അ ഇ ഉ ഫ റ ഖ ഥ ഛ ഠ {enter}",
    "{shift} എ ഃ ണ ഴ ള ശ ഷ . യ {shift}",
    ".com @ {space}",
  ],
};
