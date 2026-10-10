# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as a "systems console" single page whose content comes from editable files in `content/`.

**Architecture:** React SPA built by Vite. Content files (`content/profile.yaml`, `content/experience.yaml`, `content/projects/*.md`) are imported raw at build time and validated by pure functions in `src/content/parse.js`; invalid content fails the build. UI is a set of small section components styled with Tailwind v4 over CSS-variable theme tokens.

**Tech Stack:** React 19, Vite 8, Tailwind 4 (`@tailwindcss/vite`), `yaml`, `@phosphor-icons/react`, Geist + Geist Mono via `@fontsource-variable`, Vitest 5, ESLint 10 flat config, gh-pages.

**Spec:** `docs/superpowers/specs/2026-10-10-portfolio-redesign-design.md`

## Global Constraints

- Deploy target unchanged: GitHub Pages, Vite `base: "/portfolio/"`, `npm run deploy`.
- No external network requests at runtime (fonts self-hosted, no form/API services).
- Zero em-dash (`—`) or en-dash (`–`) characters in visible copy; use `-`.
- One accent color (green) across the page; one radius scale (`rounded-md` = 6px everywhere, `rounded-full` only for the theme toggle).
- Icons only from `@phosphor-icons/react`; no hand-written SVG paths.
- All motion disabled under `prefers-reduced-motion: reduce`.
- Dark is the default when the system has no preference; light theme is supported and tested.
- No horizontal scroll at 360px width.

### Deviations from spec (taste-skill driven)

- Display font is **Geist** (not Instrument Serif: banned display serif). Mono is Geist Mono.
- No live local-time strip in the status bar (locale strips are a known AI tell).
- Section paths are plain words: `/about`, `/projects`, `/experience`, `/stack` (clearer for recruiters than `/services`, `/changelog`, `/deps`).

## File Structure

```
content/
  profile.yaml            # name, headline, bio, links, skills, trace
  experience.yaml         # list of roles/education/milestones
  projects/*.md           # one file per project (frontmatter + description)
src/
  main.jsx                # mounts <App/>, imports styles + fonts
  App.jsx                 # page composition + palette state
  index.css               # Tailwind import, theme tokens, keyframes
  content/
    parse.js              # pure parse/validate/sort + loadContent()
    parse.test.js         # unit tests
    content.test.js       # validates the real content/ files
    index.js              # Vite glue (raw imports + glob) -> {profile, experience, projects}
  lib/
    theme.js              # useTheme() hook
    assets.js             # assetUrl(file)
  components/
    StatusBar.jsx
    Hero.jsx
    RequestTrace.jsx
    About.jsx
    SectionHeading.jsx
    Projects.jsx
    ProjectRow.jsx
    Experience.jsx
    Stack.jsx
    Footer.jsx
    CommandPalette.jsx
```

---

### Task 1: Toolchain upgrade

**Files:**
- Modify: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`
- Create: `eslint.config.js`, `src/index.css`
- Delete: `.eslintrc.cjs`, `postcss.config.cjs`, `tailwind.config.js`, `src/styles/tailwind.css`

- [ ] **Step 1: Remove old config and install deps**

```bash
rm .eslintrc.cjs postcss.config.cjs tailwind.config.js src/styles/tailwind.css
npm uninstall autoprefixer postcss eslint-plugin-react @types/react @types/react-dom
npm install react@^19.3.0 react-dom@^19.3.0 yaml@^2.9.1 @phosphor-icons/react@^2.1.10 @fontsource-variable/geist@^5.3.0 @fontsource-variable/geist-mono@^5.3.0
npm install -D vite@^8.3.4 @vitejs/plugin-react@^6.1.2 tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 vitest@^5.0.3 eslint@^10.12.0 @eslint/js@^10.0.1 eslint-plugin-react-hooks@^7.1.1 eslint-plugin-react-refresh@^0.5.7 globals@^17.13.0 gh-pages@^6.3.0
```

- [ ] **Step 2: Scripts** — in `package.json` set scripts to:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist",
"dev": "vite",
"build": "vite build",
"preview": "vite preview",
"test": "vitest run",
"lint": "eslint ."
```

- [ ] **Step 3: `vite.config.js`**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/portfolio/",
  plugins: [react(), tailwindcss()],
  test: { environment: "node" },
});
```

- [ ] **Step 4: `eslint.config.js`**

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
```

- [ ] **Step 5: `src/index.css`** (tokens; later tasks append keyframes)

```css
@import "tailwindcss";

:root {
  --bg: #0d0f0d;
  --raised: #141714;
  --line: #252925;
  --fg: #e6e8e2;
  --muted: #8d9389;
  --accent: #74d38c;
  --accent-ink: #0d0f0d;
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f3f4f0;
  --raised: #fafaf7;
  --line: #d9dcd4;
  --fg: #151814;
  --muted: #5a6057;
  --accent: #1d7a3c;
  --accent-ink: #fafaf7;
  color-scheme: light;
}

@theme inline {
  --color-bg: var(--bg);
  --color-raised: var(--raised);
  --color-line: var(--line);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, monospace;
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
}

html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; }
body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
::selection { background: var(--accent); color: var(--accent-ink); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: `index.html`** — theme set before paint, real title/meta:

```html
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dominykas Černovas, backend engineer</title>
    <meta name="description" content="Backend software engineer in Vilnius building .NET services and practical AI features." />
    <meta name="theme-color" content="#0d0f0d" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script>
      try {
        var t = localStorage.getItem("theme");
        if (!t) t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        document.documentElement.dataset.theme = t;
      } catch (e) {}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: `src/main.jsx`**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Temporarily make `src/App.jsx` `export default function App() { return <main className="p-8 font-mono text-accent">ok</main>; }` and delete the old components/data (`src/components/*`, `src/data/*`); they are rebuilt in later tasks.

- [ ] **Step 8: Verify** — `npm run build && npm run lint` both succeed.
- [ ] **Step 9: Commit** — `git commit -am "chore: upgrade to React 19, Vite 8, Tailwind 4, ESLint flat config"` (add new files first).

---

### Task 2: Content loader (TDD)

**Files:**
- Create: `src/content/parse.js`, `src/content/parse.test.js`

**Interfaces — Produces:**
- `parseFrontmatter(raw: string, file: string) -> { data: object, body: string }`
- `validateProject(slug, data, body) -> Project` where `Project = { slug, title, repo, stack: string[], year: number, status: "live"|"active"|"archived", featured: boolean, demo: string|null, image: string|null, description: string }`
- `validateProfile(data) -> Profile` where `Profile = { name, handle, role, headline, headlineAccent|null, tagline, bio, location|null, currently|null, focus: string[], links: { github, linkedin|null, email|null }, skills: Array<{ group: string, items: string[] }>, trace: Array<{ name, ms: number, note|null }> }`
- `validateExperience(list) -> Array<{ period, title, org|null, kind: "work"|"education"|"milestone", summary|null, tags: string[] }>`
- `sortProjects(list) -> Project[]` (featured first, then year desc, then title asc)
- `loadContent({ profileRaw, experienceRaw, projectFiles: Record<path, raw> }) -> { profile, experience, projects }`
- `ContentError` (Error subclass); every message starts with the file path.

- [ ] **Step 1: Write failing tests** `src/content/parse.test.js`

```js
import { describe, it, expect } from "vitest";
import {
  parseFrontmatter, validateProject, validateProfile, validateExperience,
  sortProjects, loadContent, ContentError,
} from "./parse.js";

const project = (over = {}) => ({
  title: "Point of Sale", repo: "https://github.com/x/pos",
  stack: ["ASP.NET"], year: 2024, status: "archived", ...over,
});

describe("parseFrontmatter", () => {
  it("splits yaml data and markdown body", () => {
    const { data, body } = parseFrontmatter("---\ntitle: A\nyear: 2024\n---\nHello\n", "f.md");
    expect(data).toEqual({ title: "A", year: 2024 });
    expect(body).toBe("Hello");
  });
  it("throws with file name when frontmatter is missing", () => {
    expect(() => parseFrontmatter("no frontmatter", "content/projects/x.md"))
      .toThrow(/content\/projects\/x\.md: missing frontmatter/);
  });
});

describe("validateProject", () => {
  it("normalizes a valid project", () => {
    expect(validateProject("pos", project(), "Desc")).toEqual({
      slug: "pos", title: "Point of Sale", repo: "https://github.com/x/pos",
      stack: ["ASP.NET"], year: 2024, status: "archived", featured: false,
      demo: null, image: null, description: "Desc",
    });
  });
  it.each([
    ["title", { title: "" }, /"title" is required/],
    ["repo", { repo: "github.com/x" }, /"repo" must be an http\(s\) URL/],
    ["stack", { stack: [] }, /"stack" must be a non-empty list/],
    ["year", { year: "2024" }, /"year" must be a whole number/],
    ["status", { status: "done" }, /"status" must be one of live, active, archived/],
  ])("rejects bad %s", (_, over, msg) => {
    expect(() => validateProject("pos", project(over), "Desc")).toThrow(ContentError);
    expect(() => validateProject("pos", project(over), "Desc")).toThrow(msg);
  });
  it("requires a description body", () => {
    expect(() => validateProject("pos", project(), "")).toThrow(/content\/projects\/pos\.md: description/);
  });
});

describe("sortProjects", () => {
  it("orders featured, then newest, then title", () => {
    const list = [
      { title: "B", year: 2023, featured: false },
      { title: "A", year: 2023, featured: false },
      { title: "C", year: 2025, featured: false },
      { title: "D", year: 2020, featured: true },
    ];
    expect(sortProjects(list).map((p) => p.title)).toEqual(["D", "C", "A", "B"]);
  });
});

describe("validateProfile", () => {
  const base = { name: "D", role: "Eng", headline: "H", tagline: "T", bio: "B", links: { github: "https://github.com/d" } };
  it("applies defaults", () => {
    const p = validateProfile(base);
    expect(p.handle).toBe("D");
    expect(p.skills).toEqual([]);
    expect(p.trace).toEqual([]);
    expect(p.links).toEqual({ github: "https://github.com/d", linkedin: null, email: null });
  });
  it("turns skills map into ordered groups", () => {
    const p = validateProfile({ ...base, skills: { backend: ["C#"], ai: ["RAG"] } });
    expect(p.skills).toEqual([{ group: "backend", items: ["C#"] }, { group: "ai", items: ["RAG"] }]);
  });
  it("rejects non-positive trace latency", () => {
    expect(() => validateProfile({ ...base, trace: [{ name: "api", ms: 0 }] })).toThrow(/trace\[0\]\.ms/);
  });
  it("requires links.github", () => {
    expect(() => validateProfile({ ...base, links: {} })).toThrow(/content\/profile\.yaml: "links\.github"/);
  });
});

describe("validateExperience", () => {
  it("requires a list", () => {
    expect(() => validateExperience({})).toThrow(/must be a list/);
  });
  it("validates kind with entry index", () => {
    expect(() => validateExperience([{ period: "2024", title: "X", kind: "job" }])).toThrow(/\[0\].*"kind"/);
  });
  it("normalizes optional fields", () => {
    expect(validateExperience([{ period: "2024", title: "X", kind: "work" }])).toEqual([
      { period: "2024", title: "X", org: null, kind: "work", summary: null, tags: [] },
    ]);
  });
});

describe("loadContent", () => {
  it("derives slugs from file paths and sorts", () => {
    const md = (t, y) => `---\ntitle: ${t}\nrepo: https://github.com/x/${t}\nstack: [Go]\nyear: ${y}\nstatus: active\n---\nBody`;
    const { projects } = loadContent({
      profileRaw: "name: D\nrole: E\nheadline: H\ntagline: T\nbio: B\nlinks:\n  github: https://github.com/d\n",
      experienceRaw: "[]",
      projectFiles: { "../../content/projects/old.md": md("old", 2020), "../../content/projects/new.md": md("new", 2025) },
    });
    expect(projects.map((p) => p.slug)).toEqual(["new", "old"]);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/content/parse.test.js` → FAIL (module not found).

- [ ] **Step 3: Implement** `src/content/parse.js`

```js
import { parse as parseYaml } from "yaml";

export const PROJECT_STATUSES = ["live", "active", "archived"];
export const EXPERIENCE_KINDS = ["work", "education", "milestone"];

const PROFILE_FILE = "content/profile.yaml";
const EXPERIENCE_FILE = "content/experience.yaml";
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class ContentError extends Error {
  name = "ContentError";
}

const fail = (file, message) => {
  throw new ContentError(`${file}: ${message}`);
};
const isText = (v) => typeof v === "string" && v.trim() !== "";

function text(file, value, key, { required = false } = {}) {
  if (value == null && !required) return null;
  if (!isText(value)) fail(file, `"${key}" is required and must be non-empty text`);
  return value.trim();
}

function url(file, value, key, { required = false } = {}) {
  const v = text(file, value, key, { required });
  if (v !== null && !/^https?:\/\//.test(v)) fail(file, `"${key}" must be an http(s) URL`);
  return v;
}

function list(file, value, key, { required = false } = {}) {
  if (value == null && !required) return [];
  if (!Array.isArray(value) || value.length === 0 || !value.every(isText)) {
    fail(file, `"${key}" must be a non-empty list of text`);
  }
  return value.map((v) => v.trim());
}

function oneOf(file, value, key, allowed) {
  if (!allowed.includes(value)) fail(file, `"${key}" must be one of ${allowed.join(", ")}`);
  return value;
}

export function parseFrontmatter(raw, file) {
  const match = raw.match(FRONTMATTER);
  if (!match) fail(file, "missing frontmatter block (--- ... ---) at the top of the file");
  return { data: parseYaml(match[1]) ?? {}, body: match[2].trim() };
}

export function validateProject(slug, data, body) {
  const file = `content/projects/${slug}.md`;
  if (!Number.isInteger(data.year)) fail(file, `"year" must be a whole number like 2024`);
  if (!isText(body)) fail(file, "description text below the frontmatter is required");
  return {
    slug,
    title: text(file, data.title, "title", { required: true }),
    repo: url(file, data.repo, "repo", { required: true }),
    stack: list(file, data.stack, "stack", { required: true }),
    year: data.year,
    status: oneOf(file, data.status, "status", PROJECT_STATUSES),
    featured: data.featured === true,
    demo: url(file, data.demo, "demo"),
    image: text(file, data.image, "image"),
    description: body,
  };
}

export function sortProjects(projects) {
  return [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year || a.title.localeCompare(b.title)
  );
}

export function validateProfile(data) {
  const f = PROFILE_FILE;
  if (data == null || typeof data !== "object") fail(f, "must be a YAML mapping");
  const links = data.links ?? {};
  const skills = data.skills ?? {};
  const trace = data.trace ?? [];
  if (typeof skills !== "object" || Array.isArray(skills)) fail(f, `"skills" must map group names to lists`);
  if (!Array.isArray(trace)) fail(f, `"trace" must be a list`);
  const name = text(f, data.name, "name", { required: true });
  return {
    name,
    handle: text(f, data.handle, "handle") ?? name,
    role: text(f, data.role, "role", { required: true }),
    headline: text(f, data.headline, "headline", { required: true }),
    headlineAccent: text(f, data.headlineAccent, "headlineAccent"),
    tagline: text(f, data.tagline, "tagline", { required: true }),
    bio: text(f, data.bio, "bio", { required: true }),
    location: text(f, data.location, "location"),
    currently: text(f, data.currently, "currently"),
    focus: list(f, data.focus, "focus"),
    links: {
      github: url(f, links.github, "links.github", { required: true }),
      linkedin: url(f, links.linkedin, "links.linkedin"),
      email: text(f, links.email, "links.email"),
    },
    skills: Object.entries(skills).map(([group, items]) => ({
      group,
      items: list(f, items, `skills.${group}`, { required: true }),
    })),
    trace: trace.map((hop, i) => {
      if (typeof hop?.ms !== "number" || !(hop.ms > 0)) fail(f, `"trace[${i}].ms" must be a positive number`);
      return { name: text(f, hop.name, `trace[${i}].name`, { required: true }), ms: hop.ms, note: text(f, hop.note, `trace[${i}].note`) };
    }),
  };
}

export function validateExperience(entries) {
  const f = EXPERIENCE_FILE;
  if (!Array.isArray(entries)) fail(f, "must be a list of entries");
  return entries.map((e, i) => {
    const at = `${f} [${i}]`;
    return {
      period: text(at, e?.period, "period", { required: true }),
      title: text(at, e?.title, "title", { required: true }),
      org: text(at, e?.org, "org"),
      kind: oneOf(at, e?.kind, "kind", EXPERIENCE_KINDS),
      summary: text(at, e?.summary, "summary"),
      tags: list(at, e?.tags, "tags"),
    };
  });
}

export function loadContent({ profileRaw, experienceRaw, projectFiles }) {
  const projects = Object.entries(projectFiles).map(([path, raw]) => {
    const slug = path.split("/").pop().replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(raw, `content/projects/${slug}.md`);
    return validateProject(slug, data, body);
  });
  return {
    profile: validateProfile(parseYaml(profileRaw)),
    experience: validateExperience(parseYaml(experienceRaw)),
    projects: sortProjects(projects),
  };
}
```

Note: `text()` for `at` paths produces messages like `content/experience.yaml [0]: "kind" must be one of ...`, which matches `/\[0\].*"kind"/`.

- [ ] **Step 4: Run** `npx vitest run` → all PASS.
- [ ] **Step 5: Commit** `feat: content loader with validation`.

---

### Task 3: Content files + Vite glue

**Files:**
- Create: `content/profile.yaml`, `content/experience.yaml`, `content/projects/point-of-sale.md`, `content/projects/trello-clone.md`, `content/projects/portfolio.md`, `src/content/index.js`, `src/content/content.test.js`, `src/lib/assets.js`

**Interfaces — Produces:** `import { profile, experience, projects } from "./content"` (shapes from Task 2). `assetUrl(file: string) -> string`.

- [ ] **Step 1: Failing test** `src/content/content.test.js` (guards real content):

```js
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { it, expect } from "vitest";
import { loadContent } from "./parse.js";

const root = join(import.meta.dirname, "../../content");

it("the real content/ files are valid", () => {
  const dir = join(root, "projects");
  const projectFiles = Object.fromEntries(
    readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => [`projects/${f}`, readFileSync(join(dir, f), "utf8")])
  );
  const content = loadContent({
    profileRaw: readFileSync(join(root, "profile.yaml"), "utf8"),
    experienceRaw: readFileSync(join(root, "experience.yaml"), "utf8"),
    projectFiles,
  });
  expect(content.projects.length).toBeGreaterThan(0);
  const visible = JSON.stringify(content);
  expect(visible).not.toMatch(/[–—]/); // no en/em dashes in copy
});
```

Run → FAIL (files missing).

- [ ] **Step 2: Write `content/profile.yaml`**

```yaml
# Everything on the site about you. Lines marked TODO(you) are drafts: check the facts.
name: Dominykas Černovas
handle: dominykas
role: Backend software engineer
location: Vilnius, Lithuania
currently: Software engineer at Adform # TODO(you): confirm title

# Hero. Keep each line short (it is set very large).
headline: Backends that stay up.
headlineAccent: AI that earns its place.
# Hero sub-line, max ~20 words.
tagline: I design .NET services, data models and LLM-powered features that are boring to operate. # TODO(you)

# About section paragraph.
bio: >- # TODO(you)
  I work mostly in C# and ASP.NET Core, with PostgreSQL and SQL Server underneath.
  Most of my side work now is about putting language models to practical use:
  tool-calling agents, retrieval over real data, and the evaluation it takes to trust them.

# Shown in the hero's response body.
focus: # TODO(you)
  - backend services
  - LLM tooling and agents
  - data modeling

links:
  github: https://github.com/Kurbamit
  linkedin: https://www.linkedin.com/in/dominykas-cernovas/
  email: # optional, e.g. you@example.com

# Stack section. Group name -> list. Order is kept. 4 groups fit the grid best.
skills: # TODO(you)
  backend: [C#, ASP.NET Core, Entity Framework Core, REST APIs, Keycloak]
  data: [PostgreSQL, Microsoft SQL Server, Redis]
  ai: [Claude and OpenAI APIs, Tool calling and agents, RAG and embeddings, LLM evals]
  tooling: [Docker, GitHub Actions, Linux, React]

# Hero request trace. Illustrative latencies in ms (labeled "sample" on the page).
trace:
  - { name: gateway, ms: 3, note: ASP.NET Core }
  - { name: llm, ms: 28, note: tool call }
  - { name: postgres, ms: 6, note: query }
  - { name: cache, ms: 1, note: write }
```

- [ ] **Step 3: Write `content/experience.yaml`**

```yaml
# Newest first. kind: work | education | milestone. org, summary, tags are optional.
- period: 2025 - now
  title: Software engineer # TODO(you)
  org: Adform
  kind: work
  summary: Building backend services for Adform's advertising platform. # TODO(you)
  tags: [C#, .NET]

- period: 2024 - 2025
  title: Junior software developer
  org: UAB Novian PRO
  kind: work
  summary: Built and maintained business applications end to end.
  tags: [ASP.NET, C#, SQL Server, KnockoutJS]

- period: 2023 - 2024
  title: Sales director's assistant
  org: UADBB Rizikos valdymo specialistai
  kind: work
  summary: Prepared and administered insurance offers and contracts.

- period: 2022 - now
  title: BSc Software Engineering # TODO(you): update status/graduation year
  org: Vilnius University
  kind: education

- period: "2018"
  title: First line of code
  kind: milestone
  summary: A C++ hello world, then a calculator. That is where it started.
```

- [ ] **Step 4: Project files**

`content/projects/point-of-sale.md`
```markdown
---
title: Point of Sale
repo: https://github.com/Kurbamit/PSP2
stack: [ASP.NET, React, PostgreSQL, Entity Framework]
year: 2024 # TODO(you)
status: archived
featured: true
image: pos.png
# TODO(you): check year and description
---
A point-of-sale backend for orders, payments and inventory, with a React front office.
```

`content/projects/trello-clone.md`
```markdown
---
title: Trello Clone
repo: https://github.com/PovilasPliuskus/PSK
stack: [ASP.NET, React, PostgreSQL, Keycloak]
year: 2024 # TODO(you)
status: archived
image: kanban-board.jpg
# TODO(you): check year and description
---
A team kanban board with boards, cards and Keycloak-based authentication, built as a group project.
```

`content/projects/portfolio.md`
```markdown
---
title: This portfolio
repo: https://github.com/Kurbamit/portfolio
stack: [React, Vite, Tailwind]
year: 2026
status: live
demo: https://kurbamit.github.io/portfolio/
---
The site you are on. Content lives in YAML and Markdown files that are validated at build time, so a broken entry fails the build instead of the page.
```

Drafts are flagged with YAML comments inside the frontmatter so the rendered description stays clean.

- [ ] **Step 5: `src/content/index.js`**

```js
import profileRaw from "../../content/profile.yaml?raw";
import experienceRaw from "../../content/experience.yaml?raw";
import { loadContent } from "./parse.js";

const projectFiles = import.meta.glob("../../content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const { profile, experience, projects } = loadContent({ profileRaw, experienceRaw, projectFiles });
```

`src/lib/assets.js`
```js
export const assetUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`;
```

- [ ] **Step 6: Run** `npx vitest run` → PASS. **Commit** `feat: content files`.

---

### Task 4: Shell (theme, status bar, footer, section heading)

**Files:** Create `src/lib/theme.js`, `src/components/StatusBar.jsx`, `src/components/Footer.jsx`, `src/components/SectionHeading.jsx`, `public/favicon.svg`; modify `src/App.jsx`. Delete `public/vite.svg`, `public/assets/react.svg`, `public/assets/react-vite.webp`.

**Interfaces — Produces:**
- `useTheme() -> [theme: "dark"|"light", toggle: () => void]` (persists to `localStorage.theme`, try/catch).
- `<StatusBar profile onOpenPalette theme onToggleTheme />`
- `<SectionHeading id path count? />` renders `<h2 id>` as mono `/path` with accent slash and muted count.
- `<Footer profile />`

`src/lib/theme.js`
```js
import { useCallback, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);
  return [theme, toggle];
}
```

StatusBar: `sticky top-0 z-30 h-14 border-b border-line bg-bg/85 backdrop-blur`; inner `mx-auto max-w-6xl px-4 md:px-8 flex items-center gap-6`. Left: `<a href="#top">` with a 28px `rounded-md bg-accent text-accent-ink` mono monogram (initials from `profile.name`) + `font-mono text-sm` handle. Nav (`hidden md:flex`, mono text-sm, muted, hover fg): `/about /projects /experience /stack`. Right: palette button (Phosphor `MagnifyingGlass` + `<kbd>⌘K</kbd>`, text "Search" `sr-only` on mobile), theme toggle `rounded-full` 36px button with `Sun`/`Moon` (aria-label "Switch to light/dark theme"). All buttons `active:scale-[0.97] transition-transform duration-150`.

Footer: `border-t border-line`; `mx-auto max-w-6xl px-4 md:px-8 py-12 grid gap-8 md:grid-cols-[1fr_auto] items-end`. Left: large `text-3xl md:text-4xl font-semibold tracking-tight` "Building something on the backend?" + muted line "The fastest way to reach me is LinkedIn." (single contact intent). Right: icon links `GithubLogo`, `LinkedinLogo`, `EnvelopeSimple` (only if email) with visible labels, mono. Bottom row: `© {year} {name}` and "Source on GitHub" link to the portfolio repo (`projects.find(slug==="portfolio")?.repo` fallback `links.github`).

`public/favicon.svg`: green rounded square with "dc" in mono (simple geometric mark allowed).

App shell (final composition lands in Task 8):
```jsx
<div id="top" className="min-h-[100dvh] bg-bg text-fg">
  <StatusBar ... />
  <main> {/* sections */} </main>
  <Footer profile={profile} />
</div>
```

- [ ] Verify `npm run build`, open `npm run dev`, toggle theme, reload keeps theme. Commit `feat: page shell and theme`.

---

### Task 5: Hero + RequestTrace

**Files:** Create `src/components/Hero.jsx`, `src/components/RequestTrace.jsx`; append to `src/index.css`.

**Interfaces — Consumes:** `profile` (Task 2). **Produces:** `<Hero profile />`, `<RequestTrace trace focus role location />`.

Hero layout: `section mx-auto max-w-6xl px-4 md:px-8 pt-16 md:pt-24 pb-20 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center`. Left column, each child gets `data-enter` with `--i` index for staggered entry:
1. mono `text-sm text-muted` role (the page's single eyebrow).
2. `<h1 class="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.02]">` headline, then `<span class="block text-muted">` headlineAccent.
3. `<p class="text-lg text-muted max-w-[44ch]">` tagline.
4. CTAs: primary `<a href="#projects">` "See projects" (`bg-accent text-accent-ink rounded-md px-5 h-11 font-medium`), secondary GitHub link with `GithubLogo` (`border border-line hover:bg-raised`).

RequestTrace (right column): `figure rounded-md border border-line bg-raised font-mono text-[13px]` with `aria-label="Sample request trace"`.
- Header: `GET /dominykas` (method in accent) · right side status `200 OK` that appears after the bars finish (`data-done`), plus replay button (`ArrowClockwise`, aria-label "Replay trace").
- Spans: compute `start` cumulatively; `total = sum(ms)`. Root row "dominykas" full width. Each hop row: grid `grid-cols-[6.5rem_1fr_3rem]`; name + note (muted, hidden <sm); bar `absolute h-2 rounded-[2px] bg-accent` with `left: start/total*100%`, `width: max(ms/total*100%, 3px)`; ms right-aligned tabular-nums. No background track.
- Bars animate `scaleX(0 -> 1)` from left, `animation-delay: calc(var(--d) * 1ms)` where `--d = 250 + start * 22`, duration `max(ms*22, 180)ms` capped 700, ease-out-quint. Replay increments a `run` key that remounts the span list.
- Response body under a hairline: syntax-colored JSON built from data: `{"role": ..., "focus": [...], "based": location}`; keys muted, strings fg, punctuation muted.
- Caption: `figcaption` muted "sample trace" in header.
- `done` state: `setTimeout` for total animation time, cleared on unmount/replay; reduced motion → done immediately (`matchMedia`).

CSS appended:
```css
@keyframes enter { from { opacity: 0; transform: translateY(8px); } }
[data-enter] { animation: enter 600ms var(--ease-out-quint) both; animation-delay: calc(var(--i, 0) * 70ms); }
@keyframes span-grow { from { transform: scaleX(0); } }
.span-bar { transform-origin: left; animation: span-grow var(--dur, 300ms) var(--ease-out-quint) both; animation-delay: var(--delay, 0ms); }
@keyframes fade-in { from { opacity: 0; } }
```

- [ ] Verify in browser: bars draw sequentially, replay works, 375px layout stacks. Commit `feat: hero with request trace`.

---

### Task 6: Projects

**Files:** Create `src/components/Projects.jsx`, `src/components/ProjectRow.jsx`.

**Interfaces — Consumes:** `projects: Project[]`, `assetUrl`. **Produces:** `<Projects projects />` (section `id="projects"`).

- `Projects`: `SectionHeading path="projects" count={projects.length}`; intro sentence muted; `<ul className="border-t border-line">`; `useState(openSlug)` initialised to the first project's slug (single open at a time, clicking open row closes it). Empty list → muted "No projects yet. Add a file to content/projects/."
- `ProjectRow({ project, open, onToggle })`: `<li className="border-b border-line">`; header `<button aria-expanded aria-controls>` with grid `grid-cols-[1fr_auto] md:grid-cols-[6rem_1fr_auto_4rem_1.5rem] items-center gap-4 py-5 px-2 hover:bg-raised/60 transition-colors`:
  - status (mono xs): `live`/`active` in accent with a 6px accent dot (real semantic state), `archived` muted no dot. Hidden `<md`, shown inline under the title on mobile.
  - title `text-lg md:text-xl font-medium tracking-tight`, `★ featured` → use Phosphor `Star` weight="fill" size 14 accent with `sr-only` "featured".
  - stack mono xs muted joined with " / " (hidden `<md`).
  - year mono tabular-nums muted.
  - `CaretDown` rotates 180° when open (`transition-transform duration-200`).
- Panel: wrapper `grid transition-[grid-template-rows] duration-300 ease-out-quint` with `grid-rows-[1fr]`/`grid-rows-[0fr]`, inner `overflow-hidden`; content `grid gap-6 pb-8 px-2 md:grid-cols-[1fr_minmax(0,22rem)] md:pl-[calc(6rem+1rem+0.5rem)]`: description `text-muted max-w-[60ch] leading-relaxed`, stack chips on mobile, links (`Repository` + `ArrowUpRight`, `Live site` if `demo`), image if set: `<img loading="lazy" src={assetUrl(image)} alt={`${title} screenshot`} class="aspect-[16/10] w-full object-cover rounded-md border border-line">`. Panel `inert` when closed so links are not tabbable.

- [ ] Verify toggling, keyboard (Tab to row, Enter/Space), links work. Commit `feat: projects list`.

---

### Task 7: About, Experience, Stack

**Files:** Create `src/components/About.jsx`, `src/components/Experience.jsx`, `src/components/Stack.jsx`.

- **About** (`id="about"`): `grid gap-10 md:grid-cols-[1fr_16rem]`; left: `SectionHeading path="about"` then bio as `text-2xl md:text-[2rem] leading-snug tracking-tight max-w-[32ch]`. Right: `<dl>` mono small with rows `now` → currently, `based` → location, `focus` → focus joined by line breaks. Rows separated by spacing only.
- **Experience** (`id="experience"`): `<ol>` with left rail `border-l border-line ml-3`; each `<li class="relative pl-8 pb-10 md:grid md:grid-cols-[10rem_1fr] md:gap-8">`; marker: 24px `rounded-md border border-line bg-bg` icon box at `-left-3` with Phosphor `Briefcase` (work), `GraduationCap` (education), `Flag` (milestone); `work` entries at index 0 use accent icon color. Period mono muted tabular-nums. Title `font-medium text-lg` + `org` muted (`at Adform`). Summary muted max 60ch. Tags mono xs muted joined " / ".
- **Stack** (`id="stack"`): gapless grid `grid gap-px bg-line border border-line rounded-md overflow-hidden sm:grid-cols-2 lg:grid-cols-{min(groups,4)}` (use explicit class map `{1:"lg:grid-cols-1",2:"lg:grid-cols-2",3:"lg:grid-cols-3",4:"lg:grid-cols-4"}`). Each cell `bg-bg p-6 min-h-44`; the `ai` group cell gets `bg-[color-mix(in_oklab,var(--accent)_8%,var(--bg))]` and a `Sparkle` icon (visual variation). Group name mono sm muted; items as `<ul>` text-base leading-8.

Sections share wrapper `section mx-auto max-w-6xl px-4 md:px-8 py-20 md:py-28 scroll-reveal`. CSS:
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .scroll-reveal { animation: enter linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
  }
}
```

- [ ] Verify both themes. Commit `feat: about, experience, stack sections`.

---

### Task 8: Command palette + final composition

**Files:** Create `src/components/CommandPalette.jsx`; modify `src/App.jsx`.

**Interfaces — Produces:** `<CommandPalette open onClose items />` where `items: Array<{ id, label, hint, group: "Go to"|"Projects"|"Links"|"Actions", run: () => void }>`.

- Uses native `<dialog>`; `useEffect` calls `showModal()`/`close()` on `open`; `onClose` on `close` event (Esc). Backdrop click closes (click target === dialog).
- Input `aria-label="Search"`, `role="combobox" aria-expanded aria-controls aria-activedescendant`; list `role="listbox"`, items `role="option" aria-selected`. Filter: case-insensitive substring over `label + hint`. ArrowUp/Down wrap, Enter runs active item and closes. Reset query + active index on open. Empty result: muted "No matches".
- Style: `dialog` `w-[min(36rem,calc(100vw-2rem))] mt-[12vh] rounded-md border border-line bg-raised text-fg p-0 backdrop:bg-black/50`; open animation `@keyframes palette-in { from { opacity:0; transform: scale(0.98) translateY(-4px) } }` 180ms ease-out-quint. Groups with mono muted labels; active option `bg-bg`.
- App: global `keydown` for `(metaKey||ctrlKey) && key==="k"` toggles palette (preventDefault). Items: sections (`location.hash` via `document.getElementById(id).scrollIntoView()`), each project (`window.open(repo, "_blank", "noopener")`), links, "Toggle theme".
- Final `App.jsx` order: StatusBar, Hero, About, Projects, Experience, Stack, Footer, CommandPalette.

- [ ] Verify ⌘K/Ctrl+K, arrows, Enter, Esc, backdrop. Commit `feat: command palette`.

---

### Task 9: Cleanup, docs, verification

- [ ] Delete unused: `src/components` old files (if any remain), `src/data/`, `src/styles/`. Keep `public/assets/*.jpg|png` images.
- [ ] `grep -rn "getform" src` → no matches; `grep -rnP "[\x{2013}\x{2014}]" src content index.html` → no matches.
- [ ] README: replace with "How to update content" (profile, experience, add a project file, images in `public/assets/`), commands (`dev`, `test`, `build`, `deploy`).
- [ ] `npm run lint && npm test && npm run build` all pass.
- [ ] Browser check via `npm run preview`: 1440px and 375px, dark and light, reduced motion emulated, no horizontal scroll, palette works, no console errors.
- [ ] Commit `docs: README content guide` / `chore: cleanup`.
