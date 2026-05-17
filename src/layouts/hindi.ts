import { Layout } from './types';

export const hindi: Layout = {
  name: 'hindi',
  displayName: "हिन्दी",
  scriptRange: [{ from: 0x900, to: 0x97f }],
  klidWindows: '00000439',
  default: [
    "` ऍ ॅ ्र र् ज्ञ त्र क्ष श्र ९ ० - ृ {bksp}",
    "{tab} ौ ै ा ी ू ब ह ग द ज ड ़ ॉ \\",
    "{lock} ो े ् ि ु प र क त च ट {enter}",
    "{shift} ं म न व ल स , . य {shift}",
    ".com @ {space}",
  ],
};
