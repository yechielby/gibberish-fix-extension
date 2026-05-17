import { Layout } from './types';

export const punjabi: Layout = {
  name: 'punjabi',
  displayName: "ਪੰਜਾਬੀ",
  scriptRange: [{ from: 0xa00, to: 0xa7f }],
  klidWindows: '00000446',
  default: [
    "{//} 1 2 3 4 5 6 7 8 9 0 - {//} {bksp}",
    "{tab} ੌ ੈ ਾ ੀ ੂ ਬ ਹ ਗ ਦ ਜ ਡ ਼ {//}",
    "{lock} ੋ ੇ ੍ ਿ ੁ ਪ ਰ ਕ ਤ ਚ ਟ {enter}",
    "{shift} {//} ੰ ਮ ਨ ਵ ਲ ਸ , . ਯ {shift}",
    ".com @ {space}",
  ],
};
