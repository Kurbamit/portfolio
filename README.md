# Portfolio

Personal site of Dominykas Černovas, built with React, Vite and Tailwind.
Live at https://kurbamit.github.io/portfolio/.

## Updating content

All content lives in `content/`. Nothing in `src/` needs to change.

| What | Where |
| --- | --- |
| Name, headline, bio, links, skills, hero trace | `content/profile.yaml` |
| Jobs, education, milestones | `content/experience.yaml` (newest first) |
| Projects | `content/projects/<slug>.md`, one file per project |
| Project screenshots | `public/assets/` |

### Add a project

Create `content/projects/my-project.md`:

```markdown
---
title: My Project
repo: https://github.com/Kurbamit/my-project
stack: [C#, PostgreSQL]
year: 2026
status: active        # live | active | archived
featured: false       # optional, featured projects are listed first
demo: https://...     # optional
image: my-project.png # optional, file in public/assets/
---
One to three sentences about what it does and what was interesting to build.
```

Projects are sorted featured first, then by year (newest first).

Content is validated at build time. A missing or invalid field fails `npm run build`
(and `npm test`) with a message naming the file and field.

## Commands

```bash
npm run dev      # local dev server, reloads on content changes
npm test         # content + loader tests
npm run lint
npm run build
npm run deploy   # build and publish to GitHub Pages
```

Press ⌘K / Ctrl+K on the site for the command palette.
