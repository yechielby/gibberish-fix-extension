import { Layout } from './types';

export const english: Layout = {
  name: 'english',
  displayName: 'English',
  scriptRange: [{ from: 0x0041, to: 0x005a }, { from: 0x0061, to: 0x007a }],
  klidWindows: '00000409',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; ' {enter}",
    "{shift} z x c v b n m , . / {shift}",
    ".com @ {space}",
  ],
};
