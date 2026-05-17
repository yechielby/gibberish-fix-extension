# Design: Bidirectional auto-convert + no-selection Enter fix

Date: 2026-05-17

Two independent changes to the GibberishFix extension.

## Part A — Bug: extra Enter on `Alt+Shift+L` with no selection

### Root cause

In a real text editor, `editor.action.clipboardCutAction` with no selection
cuts the **entire current line including its trailing `\n`** and deletes the
line. The guard at `pipeline.ts` (`cut === snapshot`) is therefore false (the
clipboard now holds line text), so the `selectAll` branch is skipped. The
pipeline then converts `"line\n"` and pastes it verbatim, restoring the line
**plus an extra blank line** — the spurious Enter. `clipboard.writeText` also
drops VSCode's "full-line cut" metadata, so paste does not behave as a
line-paste.

### Constraint

The extension must keep working in webview inputs (AI chat panels) where
`vscode.window.activeTextEditor` is `undefined` and selection cannot be
inspected. The existing clipboard-diff heuristic is editor-agnostic and must
remain the path for that case.

### Approach (chosen)

Inspect selection emptiness **before the first cut**, only when a real text
editor is active:

- Active editor + all selections empty + `selectAllIfNoSelection` →
  `selectAll` first, then a single cut. The line-cut-with-newline path is
  never taken.
- Active editor + all selections empty + setting disabled → abort silently
  (do not cut at all).
- No active text editor (webview / chat) → unchanged: cut, then the existing
  `cut === snapshot` heuristic.

Rejected alternatives: stripping a trailing `\n` after the fact (fragile —
cannot reliably tell a line-cut from a legitimately selected trailing
newline); rewriting via the edit API (overkill).

## Part B — Auto mode: per-character bidirectional conversion

### Behavior

`gibberish-fix.convert` (`auto`, `Alt+Shift+L`) converts **each character by
its own script**, simultaneously in both directions:

- Char in `target.scriptRange` → target → English mapping.
- Any other char (Latin letters, ASCII punctuation, digits) → English →
  target mapping.
- Ligature (multi-char) keys handled per direction; unmapped chars pass
  through unchanged.

Worked example (Hebrew target):

```
vna,bv mrhl kvhu, auuv  ארוק   →   המשתנה צריך להיות שווה  true
```

Both spaces preserved. `,` is ASCII `U+002C` (not in the Hebrew script
range) → treated as Latin → `English→target`, giving `,`→`ת`. `ארוק`
(Hebrew script) → `target→English` → `true`. This per-char classification is
what resolves the otherwise-conflicting `,` key between the two maps.

### Forced commands — unchanged

`convertToEnglish` / `convertToTarget` keep their current single-direction
behavior ("everything to one script"): they already convert only the
opposite script and pass the rest through. This is the intentional
distinction between auto (bidirectional) and forced (one direction).

### Pipeline change

Only the `forced === 'auto'` branch changes: instead of `detectDirection` +
one map, use the new bidirectional conversion. `detectDirection` stays
exported (tests depend on it) but is no longer called by the pipeline's auto
path.

## Testing

Add `node:test` cases in `test/converter.test.ts`:

- The exact worked example above.
- Double-space preservation.
- A string mixing both directions resolves each token independently.
- Existing single-direction tests remain green.
```
