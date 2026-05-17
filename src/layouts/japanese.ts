import { Layout } from './types';

export const japanese: Layout = {
  name: 'japanese',
  displayName: "日本語",
  scriptRange: [{ from: 0x3040, to: 0x30ff }],
  klidWindows: '00000411',
  default: [
    "1 2 3 4 5 6 7 8 9 0 - ^ ¥ {bksp}",
    "{tab} た て い す か ん な に ら せ ゛ ゜ む",
    "{lock} ち と し は き く ま の り れ け {enter}",
    "{shift} つ さ そ ひ こ み も ね る め {shift}",
    ".com @ {space}",
  ],
};
