# Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the section-based UI with a keyboard- and tap-driven terminal page.

**Architecture:** A pure command module turns input text plus the current context into a scrollback entry and side effects. React renders the entries; `Terminal.jsx` owns state and keyboard handling. Content still comes from `virtual:content`.

**Tech Stack:** React 19, Vite 8, Tailwind 4, Vitest, Geist Mono, Phosphor icons (theme button only).

**Spec:** `docs/superpowers/specs/2026-10-10-terminal-redesign-design.md`

## Global Constraints

- No em or en dashes in visible copy.
- All motion is off under `prefers-reduced-motion: reduce` (no boot animation, no blinking cursor).
- Tap targets are at least 44px tall on mobile; no horizontal page scroll at 360px.
- Theme tokens are CSS variables on `<html data-theme>`; the three themes are `green`, `amber` and `light`.
- Deploy unchanged.

---

### Task 1: Command module (TDD)

**Files:** Create `src/terminal/commands.js`, `src/terminal/commands.test.js`.

**Interfaces — Produces:**
- `THEMES = ["green", "amber", "light"]`, `SECTIONS = ["about", "projects", "experience", "stack", "contact"]`
- View: `{ type: "intro"|"about"|"projects"|"experience"|"stack"|"contact"|"help" } | { type: "project", slug } | { type: "error", message } | { type: "text", lines: string[] }`
- Effect: `{ type: "clear" } | { type: "theme", theme } | { type: "open", url }`
- `ctx = { projects: Project[], links: { github, linkedin, email }, theme, view: View|null }`
- `run(input: string, ctx) -> { entry: { input: string, view: View|null } | null, effects: Effect[] }`
- `itemsFor(view, ctx) -> Array<{ label, hint?, command }>`
- `pathFor(view, ctx) -> string` (`~`, `~/projects`, `~/projects/<slug>`, `~/<section>`)
- `complete(prefix) -> string | null` (unique command-name completion)

Steps: write the tests covering every row in the spec's command table, run them (they fail), implement, run them (they pass), commit.

### Task 2: Themes and shell

**Files:** Modify `src/index.css` (replace tokens with three themes, glow, scanlines, cursor), `index.html` (theme bootstrap with migration, noscript), `src/lib/theme.js` (`useTheme() -> [theme, setTheme]`), `src/main.jsx` (drop the Geist sans import), `package.json` (remove `@fontsource-variable/geist`).

### Task 3: Terminal UI

**Files:** Create `src/terminal/Terminal.jsx`, `src/terminal/views.jsx`, `src/terminal/Prompt.jsx`, `src/terminal/TitleBar.jsx`; rewrite `src/App.jsx`; delete `src/components/`, `src/lib/sections.js`.

- `Terminal`: entries `{ id, input, view }[]`; `active` index into `itemsFor(lastView)`; `history: string[]`; boot lines. `exec(input)` calls `run`, appends the entry, applies the effects, pushes non-empty input to history and resets `active` to 0.
- A window `keydown` handler applies the key map from the spec. It ignores events whose target is an input, and ignores Enter/Space when the focus is on a button or link.
- `views.jsx` renders each view type. `Options` renders buttons with a `>` marker on the active one and number labels `[1]`.
- `Prompt`: controlled input with `enterKeyHint="go"`, `autoCapitalize="off"`, `autoCorrect="off"`, `spellCheck={false}`, history and Tab completion.

### Task 4: Content and docs cleanup

- Remove `trace` from `validateProfile`, its test and `content/profile.yaml`.
- README: describe the terminal commands and themes.

### Task 5: Verify

- `npm run lint && npm test && npm run build`.
- Browser: keyboard-only walkthrough, 375px iframe check, three themes, console clean.
- Commit, push the branch, open a PR.
