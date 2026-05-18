# GibberishFix

Fix text typed in the wrong keyboard layout in **any**
VS Code input, including AI chat panels (Claude Code, Copilot, Cursor AI,
Antigravity, Gemini), the editor, search boxes, and the terminal. One
keystroke converts the text **and** switches your OS keyboard to match
(Windows), so you never lose your train of thought.

## Usage

Select gibberish text (or nothing — it converts the whole input) and press
one of:

| Shortcut | Behavior |
|---|---|
| **`Alt+Shift+L`** | **Auto / mixed** — every character is converted by its *own* script. Latin → target and target → English happen simultaneously, so mixed gibberish like `vna,bv ... ארוק` becomes `המשתנה ... true`. |
| **`Alt+Shift+E`** | **All to English** — target-script characters → English; text already in English is left untouched. |
| **`Alt+Shift+T`** | **All to target** — English → the target language; text already in the target script is left untouched. |

Rule of thumb: `Alt+Shift+L` when you typed without looking and the mess
could be in either direction; the forced commands when you want the whole
input collapsed into one script. Rebind any shortcut via
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

## Credits

The language layouts in this project are sourced from
[simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts)
by Francisco Hodge, and are licensed under the MIT License.

---

## עברית

תיקון טקסט שהוקלד ב-keyboard layout שגוי, **בכל** שדה
קלט ב-VS Code כולל צ'אטים של AI. לחיצה אחת ממירה את הטקסט **וגם** מחליפה
את שפת המקלדת של מערכת ההפעלה (Windows) - בלי לקטוע את חוט המחשבה.

בחר טקסט (או כלום - ממיר את כל הקלט) ולחץ:

- **`Alt+Shift+L`** - **אוטומטי / מעורב**: כל תו מומר לפי הסקריפט שלו עצמו;
  טקסט מעורב מתוקן בשני הכיוונים בו-זמנית
  (`vna,bv ... ארוק` → `המשתנה ... true`).
- **`Alt+Shift+E`** - **הכל לאנגלית**: תווי שפת היעד → אנגלית; אנגלית קיימת
  נשארת.
- **`Alt+Shift+T`** - **הכל לשפת היעד**: אנגלית → שפת היעד; טקסט שכבר בשפת
  היעד נשאר.
