# Portfolio redesign — "Systems console"

Date: 2026-10-10
Status: approved design

## Goal

Replace the current basic static portfolio with a distinctive site that presents
Dominykas as a backend software engineer who works well with AI, while keeping
content trivially editable through files in the repo. Remove the Getform contact form.

## Non-goals

- No CMS, no backend, no external form/API services.
- No blog.
- No framework migration (stays React + Vite + Tailwind, deployed to GitHub Pages).

## Stack

- React 18, Vite 5, Tailwind 3 (existing).
- New runtime dep: `yaml` (parse YAML / frontmatter in the browser bundle).
- New fonts: `@fontsource-variable/jetbrains-mono`, `@fontsource/instrument-serif` (self-hosted, no external requests).
- New dev dep: `vitest` for loader tests.
- Deploy unchanged: `npm run deploy` → `gh-pages -d dist`, `base: "/portfolio/"`.

## Content model (the part the owner edits)

All editable content lives in `content/` at the repo root.

### `content/profile.yaml`

```yaml
name: Dominykas Černovas
handle: dominykas.cernovas
role: Backend software engineer
location: Vilnius, LT
timezone: Europe/Vilnius
headline: "I build the parts you don't see"
headlineAccent: "— and lately, the parts that think."
bio: >-
  Short paragraph.
currently: "Software engineer @ Adform"
links:
  github: https://github.com/Kurbamit
  linkedin: https://linkedin.com/in/dominykas-cernovas
  email: null            # optional; renders a mailto link when set
skills:
  backend: [C#, ASP.NET Core, ...]
  data: [PostgreSQL, ...]
  ai: [...]
  infra: [...]
trace:                   # hops shown in the hero request trace
  - { name: api, ms: 4 }
  - { name: llm, ms: 31 }
  - { name: postgres, ms: 7 }
```

Required: `name`, `role`, `headline`, `bio`, `links.github`. Others optional with sensible defaults.

### `content/experience.yaml`

A list, newest first as written:

```yaml
- period: 2025 — now
  title: Software engineer
  org: Adform
  kind: work            # work | education | milestone
  summary: One or two sentences.
  tags: [C#, ...]
```

Required per entry: `period`, `title`, `kind`.

### `content/projects/<slug>.md`

```markdown
---
title: Point of Sale
repo: https://github.com/Kurbamit/PSP2
stack: [ASP.NET, React, PostgreSQL, Entity Framework]
year: 2024
status: archived        # live | active | archived
featured: true          # optional
demo: https://...       # optional
image: pos.png          # optional, file in public/assets/
---
One to three sentences about the problem, the design, and what was interesting.
```

Required: `title`, `repo`, `stack` (non-empty array), `year`, `status` (one of the enum).
The slug is the filename. **Adding a project = adding one file.**

Drafted copy that the owner must verify is marked with `# TODO(you)` comments
(YAML) or `<!-- TODO(you) -->` (markdown body).

## Content loader (`src/content/`)

- `parse.js` — pure functions, no Vite APIs, unit-tested:
  - `parseFrontmatter(raw)` → `{ data, body }`; throws if the `---` block is missing.
  - `validateProject(slug, data, body)` → normalized project or throws
    `Error("content/projects/<slug>.md: <field> ...")`.
  - `validateProfile(data)`, `validateExperience(list)` → same pattern.
  - `sortProjects(list)` → featured first, then `year` desc, then title asc.
- `index.js` — Vite glue: `import.meta.glob("/content/projects/*.md", { query: "?raw", import: "default", eager: true })`,
  plus `?raw` imports for the two YAML files; exports `profile`, `experience`, `projects`.
  Because the glob is eager, a broken content file fails `vite build` with the
  validation message (fail fast, never ship a half-rendered page).

## Page structure (single page, anchored sections)

1. **Status bar** (sticky): `handle`, pulsing green "online" dot, live local time in
   `timezone` (updates each minute), section links, theme toggle, ⌘K hint.
2. **Hero**: large serif headline + accent line; monospace meta (role, location,
   currently). Signature element: **request trace** — `GET /dominykas` flowing
   through the `trace` hops, each segment drawing in with its latency counting up,
   total ms at the end. Replays on click. Static (final state) under reduced motion.
3. **About**: bio rendered as a small "manifest" block (key/value mono lines + prose).
4. **`/services`** (projects): dense rows, not cards. Each row: status pill,
   name, stack, year, repo ↗. Clicking/Enter expands the row to show the description,
   optional image, and demo link. Featured rows are marked.
5. **`/changelog`** (experience): deploy-log style timeline; `kind` sets the marker
   (work ●, education ◆, milestone ○).
6. **`/deps`** (skills): grouped columns from `profile.skills`.
7. **Footer**: links (GitHub, LinkedIn, optional email), © year, "built with" line.

### Command palette

⌘K / Ctrl+K (and a button in the status bar) opens a palette listing sections,
projects (opens repo), and links. Keyboard: arrows, Enter, Esc. Filter by typing.

### Visual system

- Dark by default ("ink" near-black, warm off-white text, single signal accent —
  phosphor green for status/trace, amber for warnings/archived). Light theme
  available via toggle; choice persisted in `localStorage` (wrapped in try/catch),
  initial value from `prefers-color-scheme`.
- Typography: Instrument Serif for display, JetBrains Mono for UI/meta, system sans
  for long prose.
- Subtle grid/scanline background texture; hairline borders; no drop shadows,
  no gradients-on-buttons, no generic card grid.
- Motion: CSS-only where possible; ease-out, 150–400 ms for UI; all motion
  disabled/reduced under `prefers-reduced-motion`.
- Responsive down to 360px; no horizontal scroll; 16px gutters on phone.
- Accessibility: semantic landmarks, visible focus rings, palette is a proper
  dialog with focus trap and `aria` attributes; rows are `<button aria-expanded>`.

## Removed

- `src/components/Contact.jsx` and the Getform endpoint.
- `src/data/*` (migrated into `content/`), old components, unused assets (`react.svg`, `vite.svg` replaced by a custom favicon).

## Testing

- Vitest unit tests for `src/content/parse.js`: frontmatter parsing, required-field
  errors (message includes file + field), status enum, sorting order, defaults.
- A test that loads the real `content/` files through the same validators (guards
  against committing broken content).
- `npm run lint` and `npm run build` pass.
- Manual browser check at 1440px and 375px, dark and light, reduced motion.

## README

Update README with a "How to update content" section (add a project, edit
experience, edit profile) and the deploy command.
