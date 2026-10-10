# Portfolio redesign v2: terminal

Date: 2026-10-10
Status: approved design
Supersedes the UI parts of `2026-10-10-portfolio-redesign-design.md`. The content model,
build-time validation (`src/content/`) and deploy stay as they are.

## Goal

The whole page is one terminal window. Visitors drive it with the keyboard (arrow keys,
numbers, Enter, Esc, or typed commands) on desktop, and by tapping on mobile.

## Layout

- Desktop (md+): one centered window (max width 64rem, height `calc(100dvh - 4rem)`), with a
  title bar (three decorative dots, current path such as `dominykas@portfolio: ~/projects`,
  theme button), a scrolling scrollback area, and a prompt pinned to the bottom.
- Mobile: the terminal fills the viewport with no frame. Menu items are full-width tap
  targets (min 44px tall). Above the prompt sits a row of tappable shortcuts:
  `help`, `projects`, `contact`, `theme`, `clear`.

## Interaction model

- Every action, whether a click, a tap, a key or typed text, runs a command. The command
  line `dominykas@portfolio:~$ <command>` and its output are appended to the scrollback,
  and the new entry scrolls into view (aligned to its top).
- The newest entry's options are the active menu. Old menus stay clickable but are not
  highlighted.
- Keys (when the prompt is not focused): `↑`/`k` and `↓`/`j` move; `Enter` runs the
  highlighted option; `1`-`9` run that option; `Esc`/`Backspace` go back; `/` or any letter
  focuses the prompt.
- Prompt: `Enter` runs, `↑`/`↓` walk command history, `Tab` completes a command name,
  `Esc` leaves the prompt.
- Boot: on first visit in a session, three `[ ok ]` lines appear (~120 ms apart) and then
  `whoami` runs. Any key or tap skips it. It is skipped entirely under reduced motion.

## Commands

| Command | Aliases | Result |
| --- | --- | --- |
| `whoami` | `menu`, `home`, `cd`, `cd ~`, `~` | intro + main menu |
| `about` | `cat about`, `cat about.txt`, `cd about` | bio + facts |
| `projects` | `ls`, `ls projects`, `cd projects` | numbered project list |
| `open <n\|name>` | `cd projects/<slug>` | project details |
| `repo [n\|name]` | | opens the GitHub repo (current project if omitted) |
| `demo [n\|name]` | | opens the live site |
| `experience` | `cd experience` | timeline |
| `stack` | `cd stack` | skills tree |
| `contact` | `cd contact` | links |
| `github`, `linkedin`, `email` | | open that link |
| `theme [green\|amber\|light]` | | set the theme, or cycle when no name is given |
| `help` | `man`, `?` | command list and keys |
| `back` | `cd ..` | project → projects, anything else → menu |
| `clear` | `cls` | empties the scrollback |
| `<n>` | | runs option n of the current menu |

Unknown input prints `command not found: <cmd>. Type 'help'.` `sudo ...` prints a
permission-denied joke. An empty Enter prints an empty prompt line.

Project names resolve by list number, exact slug, slug prefix, or a substring of the title.

## Themes

- `green` (default): green phosphor on near-black.
- `amber`: amber on near-black.
- `light`: dark green on off-white.

The dark themes get a soft text glow and faint static scanlines (no flicker). The theme
is stored in `localStorage.theme` and set in `index.html` before first paint; old stored
values `dark` and `light` map to `green` and `light`.

## Architecture

- `src/terminal/commands.js`: pure. `run(input, ctx) -> { entry, effects }`,
  `itemsFor(view, ctx)`, `pathFor(view, ctx)`, `complete(prefix)`, `THEMES`. Fully unit-tested.
- `src/terminal/Terminal.jsx`: state (entries, active option, history, boot), keyboard
  handling, and applying effects (clear, theme, open URL).
- `src/terminal/views.jsx`: one renderer per view type, plus a shared `Options` menu.
- `src/terminal/Prompt.jsx`, `src/terminal/TitleBar.jsx`.
- Removed: the previous section components, the request trace and the command palette.
  The `trace` field is removed from the profile schema and content. The Geist sans font
  is dropped; everything is Geist Mono.
- `<noscript>` fallback in `index.html` with GitHub and LinkedIn links.

## Testing

- Vitest: command parsing, aliases, numbers, back, project resolution, theme cycling,
  unknown commands, clear, completion, items and paths.
- Existing content tests keep passing.
- Lint and build.
- Browser: keyboard-only walkthrough, phone width (375px), all three themes,
  reduced motion.
