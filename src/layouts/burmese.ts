import { Layout } from './types';

export const burmese: Layout = {
  name: 'burmese',
  displayName: "မြန်မာ",
  scriptRange: [{ from: 0x1000, to: 0x109f }],
  klidWindows: '00000455',
  default: [
    "ၐ ၁ ၂ ၃ ၄ ၅ ၆ ၇ ၈ ၉ ၀ - = {bksp}",
    "{tab} ဆ တ န မ အ ပ က င သ စ ဟ ဩ ၏",
    "{lock} ေ ် ိ ္ ါ ့ ျ ု ူ း ' {enter}",
    "{shift} ဖ ထ ခ လ ဘ ည ာ , . / {shift}",
    ".com @ {space}",
  ],
};
