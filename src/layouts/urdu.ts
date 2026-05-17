import { Layout } from './types';

export const urdu: Layout = {
  name: 'urdu',
  displayName: "اردو",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000420',
  default: [
    "` ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ - = {bksp}",
    "{tab} ق و ع ر ت ے ء ى ہ پ [ ]",
    "{lock} ا س د ف گ ھ ج ک ل ؛ ، {enter}",
    "{shift} ز ش چ ط ب ن م ۤ , . / {shift}",
    ".com @ {space}",
  ],
};
