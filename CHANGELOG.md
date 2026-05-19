# Changelog

## 0.1.0

- Initial release.
- Convert text typed in the wrong keyboard layout in any VS Code input,
  including AI chat webviews.
- ~32 non-Latin layouts auto-generated from simple-keyboard-layouts.
- `Alt+Shift+L` (auto) is per-character bidirectional: each character is
  converted by its own script, so mixed gibberish is fixed in both
  directions at once (e.g. `vna,bv ... ארוק` → `המשתנה ... true`).
- Forced single-direction commands: `Alt+Shift+E` sends everything to
  English, `Alt+Shift+T` everything to the target language.
- Select-all fallback when no selection (newline-safe in editors; the
  repeated-convert clipboard edge case does not wipe text).
- Silent OS keyboard-language detection (zero permissions).
- Automatic OS keyboard switch after conversion (Windows) — switches only
  among keyboard layouts already installed on the system; never adds new
  languages to the user's language bar (skips the switch if not installed).
- Target-language picker marks languages installed as OS keyboards and
  lists them first; all targets stay available (text conversion works
  regardless of OS keyboard availability).
- Configurable digits conversion and keybindings.
