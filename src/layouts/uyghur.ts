import { Layout } from './types';

export const uyghur: Layout = {
  name: 'uyghur',
  displayName: "ئۇيغۇرچە",
  scriptRange: [{ from: 0x600, to: 0x6ff }],
  klidWindows: '00000480',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} چ ۋ ې ر ت ي ۇ ڭ و پ ] [ /",
    "{lock} ھ س د ا ە ى ق ك ل ؛ : {enter}",
    "{shift} ز ش غ ۈ ب ن م ، . ئ {shift}",
    ".com @ {space}",
  ],
};
