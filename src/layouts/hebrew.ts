import { Layout } from './types';

export const hebrew: Layout = {
  name: 'hebrew',
  displayName: "עברית",
  scriptRange: [{ from: 0x590, to: 0x5ff }],
  klidWindows: '0000040d',
  default: [
    " 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} / ' ק ר א ט ו ן ם פ ] [ :",
    "{lock} ש ד ג כ ע י ח ל ך ף , {enter}",
    "{shift} ז ס ב ה נ מ צ ת ץ . {shift}",
    ".com @ {space}",
  ],
};
