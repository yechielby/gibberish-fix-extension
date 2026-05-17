import { Layout } from './types';

export const korean: Layout = {
  name: 'korean',
  displayName: "한국어",
  scriptRange: [{ from: 0x1100, to: 0x11ff }, { from: 0x3130, to: 0x318f }, { from: 0xac00, to: 0xd7af }],
  klidWindows: '00000412',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} ᄇ ᄌ ᄃ ᄀ ᄉ ᅭ ᅧ ᅣ ᅢ ᅦ [ ] \\",
    "{lock} ᄆ ᄂ ᄋ ᄅ ᄒ ᅩ ᅥ ᅡ ᅵ ; ' {enter}",
    "{shift} ᄏ ᄐ ᄎ ᄑ ᅲ ᅮ ᅳ , . / {shift}",
    ".com @ {space}",
  ],
};
