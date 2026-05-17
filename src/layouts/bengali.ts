import { Layout } from './types';

export const bengali: Layout = {
  name: 'bengali',
  displayName: "বাংলা",
  scriptRange: [{ from: 0x980, to: 0x9ff }],
  klidWindows: '00000445',
  default: [
    "‌ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯ ০ - = {bksp}",
    "{tab} স হ ে া ি ু ো ক গ ঙ য ং ্",
    "{lock} অ ই উ ট ড ন ত দ প ; ' {enter}",
    "{shift} ব ম চ জ র ল শ , . / {shift}",
    ".com @ {space}",
  ],
};
