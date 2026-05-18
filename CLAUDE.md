# GibberishFix

## Project Overview

Standalone VS Code extension that fixes text typed in the wrong keyboard
layout in **any** input — the editor, search boxes, the
terminal, and AI-chat webviews (Claude Code, Copilot, Cursor AI, Antigravity,
Gemini). One keystroke converts the selected (or whole-input) text and, on
Windows, switches the OS keyboard layout to match so the user's flow is never
interrupted.

It works via a clipboard-relay pipeline (the only mechanism that penetrates
extension webviews): cut → convert → paste → switch OS keyboard. This was
empirically validated across 5 POC iterations.

**Command semantics (load-bearing distinction):**

- `Alt+Shift+L` / `gibberish-fix.convert` (auto) — per-character
  bidirectional: each character is converted by its *own* script (Latin →
  target and target → English at once). Mixed gibberish is fixed both ways
  in a single pass. Uses `buildBidiMapping`.
- `Alt+Shift+E` / `gibberish-fix.convertToEnglish` — single direction, all
  to English (target script → English; English passes through).
- `Alt+Shift+T` / `gibberish-fix.convertToTarget` — single direction, all
  to target (English → target; target passes through).

`detectDirection` is no longer the auto path — it survives only to pick
which OS keyboard to switch to after a mixed conversion.

## Tech Stack

- **Language:** TypeScript (strict, ES2022, Node16 modules)
- **Build:** esbuild → single CJS bundle `dist/extension.js`
- **Tests:** Node built-in test runner via `tsx` (`npm test`) — pure logic only
- **VS Code API:** ^1.94.0
- **Runtime dependencies:** none (only `vscode` API + Node `child_process`/`path`)

## Commands

- `npm run gen-layouts` — regenerate `src/layouts/*` from simple-keyboard-layouts (build-time, output committed)
- `npm run build` — production esbuild bundle
- `npm run watch` — dev build with watch
- `npm test` — run converter unit + integration tests (must stay 24/24)
- `npm run package` — create the `.vsix` via `@vscode/vsce`

## Architecture

| File | Responsibility |
|---|---|
| `src/extension.ts` | Composition root: activation, command registration, target resolution |
| `src/pipeline.ts` | Orchestration: empty-selection detection → cut → convert (auto bidi / forced single) → paste → kb-switch → learn |
| `src/converter.ts` | Pure functions: `splitRow`, `isSpecial`, `buildMapping`, `buildBidiMapping`, `convert`, `detectDirection` |
| `src/settings.ts` | Workspace config + `globalState` preferred-target learning |
| `src/osLayout.ts` | Silent OS keyboard-language detection + Windows kb-switch |
| `src/statusBar.ts` | `⌨️ <lang>` status bar item → opens target QuickPick |
| `src/layouts/types.ts` | `Layout` interface |
| `src/layouts/english.ts` | Hand-written base/reference layout |
| `src/layouts/<name>.ts` | ~32 auto-generated non-Latin layouts |
| `src/layouts/index.ts` | Generated registry: `LAYOUTS`, `getLayout`, `TARGET_NAMES` |
| `scripts/import-layouts.mjs` | Build-time layout generator |
| `scripts/switch-layout.ps1` | Windows P/Invoke keyboard switch (bundled in VSIX) |

## Key Patterns & Conventions

- **`row.split(' ')` with NO trim/collapse.** Empty-string slots are
  meaningful keyboard positions (matches simple-keyboard semantics). This is
  load-bearing — never "clean up" layout row spacing.
- **Pure/impure boundary:** `converter.ts` is 100% pure and fully unit-tested;
  all VS Code/OS side effects live in `pipeline.ts` and `osLayout.ts`.
- **Generated layouts are committed** (zero runtime dependency on the upstream
  repo). Regenerate via `npm run gen-layouts`; never hand-edit `src/layouts/*`
  except `types.ts` and `english.ts`.
- **OS detection matches the Windows LANGID** (the part before the colon in an
  InputMethodTip, e.g. `040D`), not the full KLID — robust to sub-variants.
- **Graceful degradation:** unmapped/edge keys pass through unchanged
  (`Math.min(rowLen)` in `buildMapping`).
- **Fail-soft:** OS interactions never throw; missing target → info message.
- Injected/runtime constants use the `gibberish-fix.` namespace; the four
  config defaults MUST stay mirrored between `package.json` and `settings.ts`.

## Conventions

- POC-verified anchors (`tbh rumv kgau,` → `אני רוצה לעשות`, `ארוק` → `true`,
  and mixed `vna,bv mrhl kvhu, auuv  ארוק` → `המשתנה צריך להיות שווה  true`)
  are protected by integration tests against the generated Hebrew layout — if
  they fail, debug the generator, never the test or generated files.
- Windows-only OS keyboard switch in v1.0 (macOS/Linux planned for v1.1).
- Digits convert by default (critical for Farsi/Bengali native digits).

## Publishing

- Publisher: `yechielby` on the VS Code Marketplace
- Before `vsce publish`: ensure `LICENSE` ships, add a `repository` field, and
  run the manual F5 smoke test (clipboard-in-webview + live OS kb-switch).
