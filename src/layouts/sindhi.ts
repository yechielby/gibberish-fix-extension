import { Layout } from './types';

export const sindhi: Layout = {
  name: 'sindhi',
  displayName: "سنڌي",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000859',
  default: [
    "` ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ - = {bksp}",
    "{tab} ق و ع ر ت ڀ ء ي ہ پ [ ]",
    "{lock} ا س د ف گ ھ ج ک ل ؛ ، {enter}",
    "{shift} ز ش چ ط ب ن م ڇ , . / {shift}",
    ".com @ {space}",
  ],
};
