import { Layout } from './types';

export const arabic: Layout = {
  name: 'arabic',
  displayName: "العربية",
  scriptRange: [{ from: 0x600, to: 0x6ff }, { from: 0xfb50, to: 0xfdff }, { from: 0xfe70, to: 0xfeff }],
  klidWindows: '00000401',
  default: [
    "ذ 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} ض ص ث ق ف غ ع ه خ ح ج د \\",
    "{lock} ش س ي ب ل ا ت ن م ك ط {enter}",
    "{shift} ئ ء ؤ ر لا ى ة و ز ظ {shift}",
    ".com @ {space}",
  ],
};
