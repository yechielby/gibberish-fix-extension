import { Layout } from './types';

export const kannada: Layout = {
  name: 'kannada',
  displayName: "ಕನ್ನಡ",
  scriptRange: [{ from: 0xc80, to: 0xcff }],
  klidWindows: '0000044b',
  default: [
    "ೊ 1 2 3 4 5 6 7 8 9 0 - ೃ {bksp}",
    "{tab} ೌ ೈ ಾ ೀ ೂ ಬ ಹ ಗ ದ ಜ ಡ",
    "ೋ ೇ ್ ಿ ು ಪ ರ ಕ ತ ಚ ಟ {enter}",
    "{shift} ೆ ಂ ಮ ನ ವ ಲ ಸ , . / {shift}",
    ".com @ {space}",
  ],
};
