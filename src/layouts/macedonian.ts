import { Layout } from './types';

export const macedonian: Layout = {
  name: 'macedonian',
  displayName: "Македонски",
  scriptRange: [{ from: 0x400, to: 0x4ff }],
  klidWindows: '0000042f',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} љ њ е р т ѕ у и о п ш ѓ ж",
    "{lock} а с д ф г х ј к л ч ќ {enter}",
    "{shift} з џ ц в б н м , . / {shift}",
    ".com @ {space}",
  ],
};
