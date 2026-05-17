# GibberishFix

Fix text typed in the wrong keyboard layout — LangOver-style — in **any**
VS Code input, including AI chat panels (Claude Code, Copilot, Cursor AI,
Antigravity, Gemini), the editor, search boxes, and the terminal. One
keystroke converts the text **and** switches your OS keyboard to match
(Windows), so you never lose your train of thought.

## Usage

Select gibberish text and press **`Alt+Shift+L`** (auto-detect direction).
Forced direction: `Alt+Shift+E` (to English), `Alt+Shift+T` (to target).
No selection? It converts the whole input. Rebind any shortcut via
VS Code → Keyboard Shortcuts → search "GibberishFix".

## Settings

- `gibberish-fix.targetLanguage` (default `auto`)
- `gibberish-fix.switchOSKeyboard` (default `true`, Windows)
- `gibberish-fix.convertDigits` (default `true`)
- `gibberish-fix.selectAllIfNoSelection` (default `true`)

Supports ~32 non-Latin scripts (Hebrew, Arabic, Farsi, Russian, Greek,
Bengali, Japanese, Korean, and more), auto-generated from
[simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts).

Related: the [Claude Code RTL](https://marketplace.visualstudio.com/publishers/yechielby)
extensions add RTL display support — GibberishFix is a separate, complementary tool.

---

## עברית

תיקון טקסט שהוקלד ב-keyboard layout שגוי, בסגנון LangOver, **בכל** שדה
קלט ב-VS Code כולל צ'אטים של AI. לחיצה אחת ממירה את הטקסט **וגם** מחליפה
את שפת המקלדת של מערכת ההפעלה (Windows) - בלי לקטוע את חוט המחשבה.

בחר טקסט ולחץ **`Alt+Shift+L`**. ללא בחירה - ממיר את כל הקלט.
