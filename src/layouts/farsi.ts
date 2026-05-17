import { Layout } from './types';

export const farsi: Layout = {
  name: 'farsi',
  displayName: "فارسی",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000429',
  default: [
    "` ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹ ۰ - = {bksp}",
    "{tab} ض ص ث ق ف غ ع ه خ ح ج چ \\",
    "{lock} ش س ی ب ل ا ت ن م ک گ {enter}",
    "{shift} ظ ط ز ر ذ د پ و . / {shift}",
    ".com @ {space}",
  ],
};
