# Changelog

## 1.1.0

- **`Alt+Shift+L` (auto) is now per-character bidirectional.** Each character
  is converted by its own script, so mixed gibberish is fixed in both
  directions at once (e.g. `vna,bv ... ארוק` → `המשתנה ... true`). The forced
  commands keep their single-direction behavior: `Alt+Shift+E` sends
  everything to English, `Alt+Shift+T` everything to the target language.
- Fix: with no selection in a real editor, a cut grabbed the whole line
  including its newline, leaving a spurious blank line after paste.
- Fix: pressing the convert shortcut repeatedly could delete all text when
  the clipboard already matched the document content.

## 1.0.0

- Initial release.
- Convert text typed in the wrong keyboard layout in any VS Code input,
  including AI chat webviews.
- ~32 non-Latin layouts auto-generated from simple-keyboard-layouts.
- Auto-detect conversion direction; forced-direction commands.
- Select-all fallback when no selection.
- Silent OS keyboard-language detection (zero permissions).
- Automatic OS keyboard switch after conversion (Windows).
- Configurable digits conversion and keybindings.
