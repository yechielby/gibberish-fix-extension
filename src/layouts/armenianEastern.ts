import { Layout } from './types';

export const armenianEastern: Layout = {
  name: 'armenianEastern',
  displayName: "Հայերեն",
  scriptRange: [{ from: 0x530, to: 0x58f }],
  klidWindows: '0000042b',
  default: [
    "՝ : ձ յ ՛ , - . « » օ ռ ժ {bksp}",
    "{tab} խ ւ է ր տ ե ը ի ո պ չ ջ",
    "{lock} ա ս դ ֆ ք հ ճ կ լ թ փ ' {enter}",
    "{shift} զ ց գ վ բ ն մ շ ղ ծ {shift}",
    ".com @ {space}",
  ],
};
