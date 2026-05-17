import { Layout } from './types';

export const russianOld: Layout = {
  name: 'russianOld',
  displayName: "Русскiй",
  scriptRange: [{ from: 0x400, to: 0x4ff }],
  klidWindows: '00000419',
  default: [
    "ё 1 2 3 4 5 6 7 8 9 0 ц э {bksp}",
    "{tab} й i у к е н г ш щ з х ѳ \\",
    "{lock} ф ы в ъ а п р о л д ж ѵ {enter}",
    "{shift} / я ѣ ч с м и т ь б ю . {shift}",
    ".com @ {space}",
  ],
};
