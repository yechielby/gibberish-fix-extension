import { Layout } from './types';

export const telugu: Layout = {
  name: 'telugu',
  displayName: "తెలుగు",
  scriptRange: [{ from: 0xc00, to: 0xc7f }],
  klidWindows: '0000044a',
  default: [
    "ొ 1 2 3 4 5 6 7 8 9 0 - ృ {bksp}",
    "{tab} ౌ ై ా ీ ూ బ హ గ ద జ డ {//} {//}",
    "{lock} ో ే ్ ి ు ప ర క త చ ట {enter}",
    "{shift} {//} ె ం మ న వ ల స , . య {shift}",
    ".com @ {space}",
  ],
};
