import { Layout } from './types';

export const thai: Layout = {
  name: 'thai',
  displayName: "ไทย",
  scriptRange: [{ from: 0xe00, to: 0xe7f }],
  klidWindows: '0000041e',
  default: [
    "_ ๅ / - ภ ถ ุ ึ ค ต จ ข ช {bksp}",
    "{tab} ๆ ไ ำ พ ะ ั ี ร น ย บ ล ฃ",
    "{lock} ฟ ห ก ด เ ้ ่ า ส ว ง {enter}",
    "{shift} ผ ป แ อ ิ ื ท ม ใ ฝ {shift}",
    ".com @ {space}",
  ],
};
