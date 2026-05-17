import { Layout } from './types';

export const odia: Layout = {
  name: 'odia',
  displayName: "ଓଡ଼ିଆ",
  scriptRange: [{ from: 0xb00, to: 0xb7f }],
  klidWindows: '00000448',
  default: [
    "୦ ୧ ୨ ୩ ୪ ୫ ୬ ୭ ୮ ୯ ଋ ୃ {bksp}",
    "{tab} ୌ ୈ ା ୀ ୂ  ବ ହ ଗ ଦ ଜ ଡ ଼",
    "{lock} ୋ େ ୍ ି ୁ ପ ର କ ତ ଚ ଟ {enter}",
    "{shift} ୟ ଂ ମ ନ ୱ ଲ ସ , . ୟ {shift}",
    ".com @ {space}",
  ],
};
