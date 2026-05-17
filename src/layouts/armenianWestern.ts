import { Layout } from './types';

export const armenianWestern: Layout = {
  name: 'armenianWestern',
  displayName: "Հայերեն",
  scriptRange: [{ from: 0x530, to: 0x58f }],
  klidWindows: '0000042b',
  default: [
    "՝ : ձ յ ՛ , - . « » օ ռ ժ {bksp}",
    "{tab} խ վ է ր դ ե ը ի ո պ չ ջ",
    "{lock} ա ս տ ֆ կ հ ճ ք լ թ փ ' {enter}",
    "{shift} զ ց գ ւ բ ն մ շ ղ ծ {shift}",
    ".com @ {space}",
  ],
};
