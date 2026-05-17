import { Layout } from './types';

export const kurdish: Layout = {
  name: 'kurdish',
  displayName: "کوردی",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000492',
  default: [
    "١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ - = {bksp}",
    "{tab} ق و ە ر ت ی ئ ع ۆ پ",
    "{lock} ا س د ف گ ه ژ ک ل {enter}",
    "{shift} ز خ ج ڤ ب ن م {shift}",
    ".com @ {space}",
  ],
};
