import { Layout } from './types';

export const georgian: Layout = {
  name: 'georgian',
  displayName: "ქართული",
  scriptRange: [{ from: 0x10a0, to: 0x10ff }],
  klidWindows: '00000437',
  default: [
    "„ 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} ქ წ ე რ ტ ყ უ ი ო პ [ ] \\",
    "{lock} ა ს დ ფ გ ჰ ჯ კ ლ ; ' {enter}",
    "{shift} ზ ხ ც ვ ბ ნ მ , . / {shift}",
    ".com @ {space}",
  ],
};
