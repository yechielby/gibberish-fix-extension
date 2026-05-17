import { Layout } from './types';

export const urduStandard: Layout = {
  name: 'urduStandard',
  displayName: "اردو",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000420',
  default: [
    "` ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ - = {bksp}",
    "{tab} ط ص ھ د ٹ پ ت ب ج ح ] [ \\",
    "{lock} م و ر ن ل ہ ا ک ى ؛ ٬ {enter}",
    "{shift} ق ف ے س ش غ ع ، ۔ / {shift}",
    ".com @ {space}",
  ],
};
