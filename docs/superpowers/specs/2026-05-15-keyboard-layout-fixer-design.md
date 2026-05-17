# Design Document: GibberishFix

> תוסף VS Code עצמאי בסגנון LangOver - המרת טקסט שהוקלד בשפה לא נכונה בכל input בכל IDE, כולל החלפת שפת מקלדת אוטומטית. **המטרה: אפס קטיעת חוט המחשבה.**

| שדה | ערך |
|---|---|
| תאריך יצירה | 2026-05-15 |
| מחבר | (YechielBy) |
| סטטוס | Final - ממתין לאישור (POC מלא + ניתוח 46 שפות הושלמו) |
| גרסה ראשונה | 1.0.0 |
| שם תוסף | `gibberish-fix` |
| Publisher | `yechielby` |

---

## 1. תקציר מנהלים

תוסף VS Code עצמאי שמתקן טקסט שהוקלד ב-keyboard layout לא נכון. דוגמה: המשתמש הקליד `tbh rumv kgau,` בעוד layout עברי פעיל - לחיצה אחת על `Alt+Shift+L` הופכת ל-`אני רוצה לעשות`, **וגם מחליפה את שפת המקלדת של ה-OS** כך שהמשתמש ממשיך להקליד ברצף.

**שלושה מאפיינים ייחודיים:**
1. עובד **בכל input** ב-VS Code - עורך, צ'אט של Claude Code, Copilot, Cursor AI, Antigravity, Gemini, חיפוש, terminal.
2. **מחליף שפת מקלדת OS** אחרי המרה (Windows ב-V1.0).
3. **~32 שפות non-Latin**, auto-generated מ-simple-keyboard-layouts, אפס עבודה ידנית.

תוסף **אחד** במקום הוספת הפיצ'ר ל-5 תוספי ה-RTL הקיימים בנפרד.

---

## 2. הבעיה שאנו פותרים

### תרחיש המשתמש

מפתחים דו-לשוניים מחליפים תדיר בין layouts:

1. כותב קוד באנגלית → עונה בעברית → חוזר לעורך וממשיך **בלי לשים לב ש-layout עדיין עברי**
2. רואה ג'יבריש: `tbh rumv kgau,` במקום `אני רוצה לעשות`
3. כיום: מוחק הכל, מחליף layout ידנית, מקליד מחדש

### העיקרון המנחה: אפס קטיעת זרימה

**הסיבה המרכזית לתוסף:** מפתח לא צריך לאבד את חוט המחשבה בגלל טעות layout. כל צעד ידני (למחוק, להקליד מחדש, להחליף מקלדת) קוטע את הריכוז. הפתרון: **לחיצה אחת מתקנת הכל וממשיכה** - כולל החלפת המקלדת אוטומטית, כדי שגם הצעד הבא לא נקטע.

### למה הפתרונות הקיימים לא מספקים

| פתרון | חיסרון |
|---|---|
| LangOver (Windows native) | רק Windows, חיצוני ל-IDE |
| AutoHotkey | רק Windows, תחזוקה ידנית |
| תוספי VS Code קיימים | רק בעורך, לא ב-webviews של תוספי AI |
| לחזור ולהקליד | קוטע את חוט המחשבה |

---

## 3. מטרות ואי-מטרות

### ✅ מטרות (V1.0) - כולן אומתו ב-POC

- המרת טקסט בכל input ב-VS Code/Cursor/Antigravity/Kiro
- **~32 שפות non-Latin** auto-generated, אפס עבודה ידנית
- זיהוי כיוון אוטומטי + 2 פקודות כיוון מאולץ
- **Select-All אוטומטי** אם אין selection (clipboard-diff)
- **זיהוי שפות OS** - שקט, אפס הרשאות
- **החלפת שפת מקלדת** אחרי המרה - **Windows V1.0**
- **המרת ספרות by default** + הגדרה לביטול
- Keybinding ניתן להתאמה
- אפס תלות native

### ❌ אי-מטרות (V1.0)

- ❌ וריאנטים לטיניים (German, French, Spanish...) - ערך נמוך ל-LangOver
- ❌ החלפת מקלדת macOS/Linux (V1.1)
- ❌ הזרקת JS ל-webviews של תוספים אחרים - לא נחוץ
- ❌ Hooks ברמת OS
- ❌ Preview לפני המרה / Undo מיוחד (Ctrl+Z מספיק)

---

## 4. תגליות טכניות - אומתו ב-POC

5 איטרציות POC + ניתוח 46 layouts. **הכל אומת אמפירית.**

### 4.1 פקודות clipboard חודרות ל-webviews ✅
`editor.action.clipboardCutAction`/`clipboardPasteAction`/`selectAll` שולחות event לאלמנט הממוקד; Chromium קולט נטיבית. **הוכחה:** `tbh rumv kgau,` בצ'אט של Claude → `אני רוצה לעשות`.

### 4.2 Select-All fallback ✅
clipboard-diff: snapshot → cut → אם לא השתנה → selectAll → cut שוב.

### 4.3 זיהוי שפות OS - שקט, אפס הרשאות ✅
`Get-WinUserLanguageList` + registry `HKCU:\Keyboard Layout\Preload` החזירו שפות מותקנות בלי prompt. רשימת שפות אינה מידע רגיש.

### 4.4 החלפת מקלדת Windows ✅
PowerShell P/Invoke: `GetForegroundWindow` → `LoadKeyboardLayout` → `PostMessage(WM_INPUTLANGCHANGEREQUEST)`. אומת: ההקלדה התחלפה בפועל, גם בעורך וגם בצ'אט של Claude. אין צורך ב-native node module.

### 4.5 Pipeline מלא end-to-end ✅
`ארוק`→`true`, `akuo`→`שלום`, `tbh rumv kgau,`→`אני רוצה לעשות` (בצ'אט) - כולל החלפת מקלדת.

### 4.6 פרשנות layout נכונה - תגלית קריטית ✅
simple-keyboard מפרסר עם **`row.split(" ")` בלבד** - בלי trim, בלי collapse. רווח מוביל / רווח כפול = מיקום ריק **משמעותי**. עם הסמנטיקה הנכונה:
- **24 שפות = 100%** כיסוי אותיות
- **21 שפות = 90-99%** (רק מקשי קצה לא ממופים)
- **Kurdish = 76%** (layout "letters-only", כל אותיותיו עובדות)
- **Hebrew = 100% drop-in** - לא צריך תיקון ידני (הרווח המוביל הוא הקידוד הנכון)

---

## 5. ארכיטקטורה

### 5.1 ה-Pipeline (אומת)

```
gibberish-fix.convert  (Alt+Shift+L)
  1. snapshot = clipboard.readText()
  2. executeCommand('editor.action.clipboardCutAction')
  3. cut = clipboard.readText()
  4. IF cut === snapshot:                    ← אין selection
        executeCommand('editor.action.selectAll')
        executeCommand('editor.action.clipboardCutAction')
        cut = clipboard.readText()
  5. IF still empty → abort בשקט
  6. direction = detectDirection(cut, targetLayout)
  7. converted = convert(cut, mapFor(direction))
  8. clipboard.writeText(converted)
  9. executeCommand('editor.action.clipboardPasteAction')
 10. IF Windows && switchOSKeyboard:
        child_process → switch-layout.ps1 <KLID של הכיוון החדש>
 11. globalState.update('preferredTarget', usedNonEnglishLang)
```

### 5.2 קבצים

```
gibberish-fix/
├── src/
│   ├── extension.ts        ← Entry, commands+keybindings
│   ├── pipeline.ts         ← 11 הצעדים
│   ├── converter.ts        ← buildMapping, convert, detectDirection
│   ├── osLayout.ts         ← זיהוי שפות OS + kb-switch (Windows)
│   ├── settings.ts         ← config + globalState (target learning)
│   └── layouts/
│       ├── types.ts
│       ├── english.ts      ← בסיס (reference, לא target)
│       ├── <~32 non-Latin>.ts  ← auto-generated
│       └── index.ts
├── scripts/
│   ├── import-layouts.mjs  ← build-time generator (correct split)
│   └── switch-layout.ps1   ← נארז ב-VSIX
├── package.json / tsconfig.json / esbuild.mjs
├── README.md (EN + HE) / CHANGELOG.md / icon.png
```

### 5.3 Dependencies
Runtime: VS Code API + Node `child_process` בלבד. **אפס תלות runtime.**
Dev: `@types/vscode`, `@types/node`, `typescript`, `esbuild`, `@vscode/vsce`.

### 5.4 מנגנון kb-switch
`scripts/switch-layout.ps1` בתוך VSIX. נקרא: `execFile('powershell.exe', ['-NoProfile','-ExecutionPolicy','Bypass','-File',script,klid], {windowsHide:true})`. ב-Mac/Linux שלב 10 מדלג. מבנה מאפשר `switchMac/Linux` ב-V1.1 בלי שינוי pipeline.

---

## 6. ייצור ה-Layouts (build-time, אוטומטי)

`scripts/import-layouts.mjs` רץ פעם אחת, התוצאה נדחפת ל-git (אין dependency runtime):

```
1. git clone --depth 1 simple-keyboard-layouts → temp
2. לכל ~32 שפה non-Latin:
   a. parse default[] עם split(" ") הנכון (בלי trim/collapse)
   b. decode \uXXXX
   c. align position-by-position מול english.ts
   d. דלג על מקשים מיוחדים ({tab}/{shift}/ריק); ספרות = flag נפרד
   e. כתוב src/layouts/<name>.ts בפורמט Layout
3. כתוב index.ts + coverage-report.md (אחוז כיסוי לכל שפה)
```

**graceful degradation:** מיקום בלי מיפוי תקין → התו עובר ללא שינוי. מקובל (מקשי קצה נדירים).

רשימת ~32 השפות: כל non-Latin (Arabic family 9, Cyrillic 5, Indic 8, Armenian 2, CJK 2, + hebrew/greek/thai/burmese/georgian/nko). הרשימה המלאה ב-`import-layouts.mjs`.

---

## 7. מודל הנתונים

```typescript
// src/layouts/types.ts
export interface Layout {
  name: string;                                 // identifier
  displayName: string;                          // שם להצגה (שפה מקומית)
  scriptRange: { from: number; to: number }[];  // טווח Unicode לזיהוי כיוון
  klidWindows: string;                          // KLID להחלפת מקלדת
  default: string[];                            // 5 שורות (raw simple-keyboard)
}
```

ה-rows נשמרים כפי שהם (raw), הפרסור (`split(" ")`) נעשה ב-`buildMapping`.

---

## 8. אלגוריתם ההמרה (אומת)

```typescript
const splitRow = (r: string) => r.split(' ');           // כמו simple-keyboard
const isSpecial = (k: string) => k === '' || k.startsWith('{');

function buildMapping(from: Layout, to: Layout, convertDigits: boolean): Map<string,string> {
  const map = new Map<string,string>();
  for (let r = 0; r < from.default.length; r++) {
    const f = splitRow(from.default[r]), t = splitRow(to.default[r]);
    const n = Math.min(f.length, t.length);             // graceful: רק מה שמיושר
    for (let i = 0; i < n; i++) {
      const fk = f[i], tk = t[i];
      if (isSpecial(fk) || isSpecial(tk)) continue;
      if (!convertDigits && /^\d$/.test(fk)) continue;
      map.set(fk, tk);
    }
  }
  return map;
}

function convert(text: string, map: Map<string,string>): string {
  const ligs = [...map.entries()].filter(([k]) => k.length > 1);   // Arabic لا
  for (const [a,b] of ligs) text = text.split(a).join(b);
  return [...text].map(c => map.get(c) ?? c).join('');
}

function detectDirection(text: string, target: Layout): 'toEnglish'|'toTarget' {
  let tgt=0, lat=0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (target.scriptRange.some(r => cp>=r.from && cp<=r.to)) tgt++;
    else if ((cp>=0x41&&cp<=0x5A)||(cp>=0x61&&cp<=0x7A)) lat++;
  }
  return tgt > lat ? 'toEnglish' : 'toTarget';
}
```

---

## 9. Detection & Target Selection (אומת)

```
בעת activation (silent, אפס prompt):
├─ detected = detectOSLayouts()
├─ nonEnglish = detected ∩ (~32 נתמכות) \ english
│
├─ length 0:  רק אנגלית. הפיצ'ר רדום.
├─ length 1:  targetLanguage = nonEnglish[0]  ⭐ ZERO CONFIG
└─ length 2+: globalState saved אם קיים, אחרת ראשון
              המשתמש משנה בהגדרות (dropdown דינמי - רק המותקנות)

למידה: אחרי המרה משפה X (≠english) → globalState.preferredTarget = X
שפה מזוהה לא-נתמכת: מתעלמים; אם יחידה → notification עדין חד-פעמי
detection רץ בכל activation (~50ms) → הסתגלות להוספת/הסרת שפה
```

> **הערה (final review):** בחירה ידנית ב-QuickPick של ה-status bar כותבת `targetLanguage` ל-config הגלובלי. מרגע זה `resolveTarget` מקצר דרך (`targetLanguage !== 'auto'`) ונתיב ה-auto-detection/learning הופך רדום עבור אותו משתמש. זו התנהגות מכוונת ("בחירה מפורשת מנצחת") ומקובלת ל-V1.0 — מנגנון ה-learning פעיל רק עבור מי שלא נגע ב-QuickPick. לאיפוס חזרה ל-auto: הגדרת `targetLanguage` בחזרה ל-`"auto"` ב-Settings.

---

## 10. ממשק המשתמש

### Commands
| ID | Title |
|---|---|
| `gibberish-fix.convert` | Convert (auto) |
| `gibberish-fix.convertToEnglish` | Convert to English (forced) |
| `gibberish-fix.convertToTarget` | Convert to Target (forced) |
| `gibberish-fix.showMenu` | Show Menu (QuickPick) |

### Keybindings (ברירת מחדל, ניתנים לשינוי דרך VS Code)
```
convert          → alt+shift+l
convertToEnglish → alt+shift+e
convertToTarget  → alt+shift+t
```

### Settings
```
targetLanguage          (string, default "auto")  — auto=זיהוי OS; אחרת dropdown דינמי
switchOSKeyboard        (boolean, default true)    — החלף מקלדת אחרי המרה (Windows V1.0)
convertDigits           (boolean, default true)    — המר ספרות (קריטי ל-Farsi/Bengali)
selectAllIfNoSelection  (boolean, default true)    — בחר הכל אם אין selection
```

### Status Bar
`⌨️ Hebrew` - שפת יעד נוכחית. לחיצה → QuickPick.

---

## 11. Edge Cases

| מקרה | טיפול |
|---|---|
| Ligatures (Arabic `لا`) | מפתח רב-תווי, מוחלף ראשון |
| ספרות | מומרות by default; `convertDigits:false` לביטול. Farsi/Bengali=ספרות שונות (קריטי), Hebrew/Arabic=זהות (no-op) |
| פיסוק זהה ל-English | no-op map - תקין |
| טקסט מעורב | majority vote + פקודות כיוון מאולץ |
| selection ריקה | select-all fallback; אם עדיין ריק → abort בשקט |
| selectAll תופס `\n` | `\n` עובר as-is - מינורי (אומת) |
| input ריק לגמרי | abort בשקט, אין notification מטריד (אומת) |
| עורך readonly | cut נכשל → clipboard לא משתנה → select-all+cut שוב גם נכשל → step 5 מבצע **abort בטוח ושקט** (ללא paste, ללא דריסת clipboard). _עודכן ב-final review: ההתנהגות הממומשת בטוחה יותר מהתכנון המקורי (אין clipboard-clobber) — זו ההתנהגות הרצויה._ |
| PowerShell חסום (ארגוני) | kb-switch fail-silent; ההמרה לא מושפעת |
| layout "letters-only" (Kurdish) | מקשים לא מוגדרים → graceful degradation (תו עובר as-is) |
| מקש קצה לא מיושר (21 שפות ב-90%+) | `Math.min(len)` ב-buildMapping → התו עובר as-is |

---

## 12. Build, Distribution & עתיד

```
npm run gen-layouts → import-layouts.mjs (חד-פעמי, תוצאה ב-git)
npm run build       → esbuild → dist/extension.js
npm run package     → vsce → gibberish-fix-1.0.0.vsix (~60KB)
```
`switch-layout.ps1` כלול ב-`files` של VSIX.

### Marketplace Identity (אחידות שם ↔ keywords)

זהות עקבית סביב השם **GibberishFix** - אין שם-מוצר חלופי:

| שדה | ערך |
|---|---|
| `name` (package.json) | `gibberish-fix` |
| `displayName` | `GibberishFix` |
| Publisher | `yechielby` |
| `keywords` | `gibberish-fix`, `gibberishfix`, `gibberish`, `langover`, `keyboard layout`, `wrong layout`, `hebrew`, `arabic`, `persian`, `rtl`, `typing fix` |

ה-keywords הראשונים = **זהות המותג** (עקבי עם `name`/`displayName`). השאר = **מונחי חיפוש תיאוריים** בלבד (מה שמשתמש מקליד בחיפוש), לא שמות-מוצר מתחרים. `keyboard-layout-fixer` **הוסר** - לא keyword ולא שם חלופי.

### Roadmap
| גרסה | פיצ'ר |
|---|---|
| 1.1 | החלפת מקלדת macOS + Linux |
| 1.1 | וריאנטים לטיניים (German/French) לפי ביקוש |
| 1.2 | QuickPick מלא לבחירה מכל השפות |
| 1.3 | Multi-cursor selection |

---

## 13. סיכונים

| סיכון | סבירות | חומרה | הקלה |
|---|---|---|---|
| `clipboardCutAction` יפסיק לחדור webview | נמוכה | גבוהה | regression tests; fallback clipboard-relay |
| Alt+Shift+L בטעות | בינונית | בינונית | keybinding ניתן לשינוי; notification קצר |
| Ligature Arabic שגוי | נמוכה | בינונית | unit tests לכל ligature |
| `WM_INPUTLANGCHANGEREQUEST` flaky | נמוכה | נמוכה | אומת יציב; ההמרה לא תלויה בזה |
| PowerShell policy ארגוני | נמוכה | נמוכה | fail-silent; core עובד |
| simple-keyboard layout שגוי במקור | נמוכה | בינונית | coverage-report.md; QA לשפות עיקריות |

---

## 14. החלטות פתוחות - ברירות מחדל (ניתנות לעקיפה)

| # | החלטה | ברירת מחדל |
|---|---|---|
| 1 | שם תצוגה Marketplace | ✅ הוכרע: "GibberishFix" - ראה "Marketplace Identity" בסעיף 12 |
| 2 | לוגו | סגנון תוספי RTL הקיימים |
| 3 | שילוב עם claude-code-rtl | הפרדה מוחלטת (cross-link ב-README) |
| 4 | README | אנגלית + עברית |

---

## 15. סיכום החלטות מאושרות (כולן אומתו)

| החלטה | ערך |
|---|---|
| שם | `gibberish-fix` |
| ארכיטקטורה | תוסף עצמאי |
| מנגנון המרה | clipboardCut → convert → clipboardPaste ✅ |
| Select-all fallback | clipboard-diff ✅ |
| OS detection | silent, אפס הרשאות ✅ |
| החלפת מקלדת | Windows V1.0 (PowerShell P/Invoke) ✅ |
| Target selection | 1=auto, 2+=הגדרה+למידה |
| שפות V1.0 | **~32 non-Latin**, auto-generated, אפס עבודה ידנית |
| מקור layouts | simple-keyboard-layouts, build-time, split(" ") נכון |
| ספרות | מומרות by default + `convertDigits` |
| Keybinding | `Alt+Shift+L/E/T`, ניתן לשינוי |
| תלות native | אין |

---

## 16. השלב הבא

1. ✅ POC מלא (5 איטרציות) + ניתוח 46 שפות הושלמו
2. ✅ Design self-review
3. ➡️ ביקורת המשתמש על המסמך
4. ➡️ `superpowers:writing-plans` ליצירת implementation plan
5. ➡️ יצירת `c:\Code\gibberish-fix\` והתחלת מימוש
