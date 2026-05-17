import { Layout } from './types';
import { english } from './english';
import { arabic } from './arabic';
import { balochi } from './balochi';
import { farsi } from './farsi';
import { gilaki } from './gilaki';
import { kurdish } from './kurdish';
import { sindhi } from './sindhi';
import { urdu } from './urdu';
import { urduStandard } from './urduStandard';
import { uyghur } from './uyghur';
import { belarusian } from './belarusian';
import { macedonian } from './macedonian';
import { russian } from './russian';
import { russianOld } from './russianOld';
import { ukrainian } from './ukrainian';
import { assamese } from './assamese';
import { bengali } from './bengali';
import { hindi } from './hindi';
import { kannada } from './kannada';
import { malayalam } from './malayalam';
import { odia } from './odia';
import { punjabi } from './punjabi';
import { telugu } from './telugu';
import { armenianEastern } from './armenianEastern';
import { armenianWestern } from './armenianWestern';
import { japanese } from './japanese';
import { korean } from './korean';
import { hebrew } from './hebrew';
import { greek } from './greek';
import { thai } from './thai';
import { burmese } from './burmese';
import { georgian } from './georgian';
import { nko } from './nko';

export const LAYOUTS: Record<string, Layout> = {
  english,
  arabic,
  balochi,
  farsi,
  gilaki,
  kurdish,
  sindhi,
  urdu,
  urduStandard,
  uyghur,
  belarusian,
  macedonian,
  russian,
  russianOld,
  ukrainian,
  assamese,
  bengali,
  hindi,
  kannada,
  malayalam,
  odia,
  punjabi,
  telugu,
  armenianEastern,
  armenianWestern,
  japanese,
  korean,
  hebrew,
  greek,
  thai,
  burmese,
  georgian,
  nko,
};

export function getLayout(name: string): Layout | undefined {
  return LAYOUTS[name];
}

export const TARGET_NAMES: string[] = ['arabic', 'balochi', 'farsi', 'gilaki', 'kurdish', 'sindhi', 'urdu', 'urduStandard', 'uyghur', 'belarusian', 'macedonian', 'russian', 'russianOld', 'ukrainian', 'assamese', 'bengali', 'hindi', 'kannada', 'malayalam', 'odia', 'punjabi', 'telugu', 'armenianEastern', 'armenianWestern', 'japanese', 'korean', 'hebrew', 'greek', 'thai', 'burmese', 'georgian', 'nko'];
