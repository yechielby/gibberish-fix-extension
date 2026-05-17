import { Layout } from './types';

export const belarusian: Layout = {
  name: 'belarusian',
  displayName: "Беларуская",
  scriptRange: [{ from: 0x400, to: 0x4ff }],
  klidWindows: '00000423',
  default: [
    "ё ` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} й ц у к е н г ш ў з х [ ] \\",
    "{lock} ф ы в а п р о л д ж э ; ' {enter}",
    "{shift} я ч с м і т ь б ю , . / {shift}",
    ".com @ {space}",
  ],
};
