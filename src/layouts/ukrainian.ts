import { Layout } from './types';

export const ukrainian: Layout = {
  name: 'ukrainian',
  displayName: "Українська",
  scriptRange: [{ from: 0x400, to: 0x4ff }],
  klidWindows: '00000422',
  default: [
    "' 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} й ц у к е н г ш щ з х ї ґ \\",
    "{lock} ф і в а п р о л д ж є {enter}",
    "{shift} / я ч с м и т ь б ю . {shift}",
    ".com @ {space}",
  ],
};
