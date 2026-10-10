// Pure command interpreter for the terminal UI: text in, scrollback entry + side effects out.

export const THEMES = ["green", "amber", "light"];
export const SECTIONS = ["about", "projects", "experience", "education", "stack", "contact"];

const SECTION_HINTS = {
  about: "who I am",
  projects: "things I've built",
  experience: "where I've worked",
  education: "where I've studied",
  stack: "tools I use",
  contact: "where to find me",
};

// Section that "next" points to from each section view.
const NEXT = { about: "projects", experience: "education", education: "stack", stack: "contact" };

const COMMAND_NAMES = [
  "whoami", "menu", ...SECTIONS, "open", "repo", "demo",
  "github", "linkedin", "email", "theme", "help", "back", "clear",
];

const INTRO = new Set(["whoami", "menu", "home", "~"]);
const HELP = new Set(["help", "man", "?"]);

const show = (input, view) => ({ entry: { input, view }, effects: [] });
const error = (input, message) => show(input, { type: "error", message });
const open = (input, url, label = url) => ({
  entry: { input, view: { type: "text", lines: [`opening ${label.replace(/^mailto:/, "")}`] } },
  effects: [{ type: "open", url }],
});

export function findProject(query, projects) {
  if (!query) return null;
  const q = query.toLowerCase();
  if (/^\d+$/.test(q)) return projects[Number(q) - 1] ?? null;
  return (
    projects.find((p) => p.slug === q) ??
    projects.find((p) => p.slug.startsWith(q)) ??
    projects.find((p) => p.title.toLowerCase().includes(q)) ??
    null
  );
}

function back(view) {
  return view?.type === "project" ? { type: "projects" } : { type: "intro" };
}

function currentProject(ctx) {
  return ctx.view?.type === "project" ? ctx.projects.find((p) => p.slug === ctx.view.slug) : null;
}

function resolveCd(target) {
  if (!target || target === "~" || target === "/") return { type: "intro" };
  if (target === "..") return "back";
  const [section, slug] = target.replace(/^~\//, "").replace(/\/$/, "").split("/");
  if (section === "projects" && slug) return { type: "open", slug };
  if (SECTIONS.includes(section)) return { type: section };
  return null;
}

export function run(rawInput, ctx) {
  const input = rawInput.trim();
  if (!input) return show("", null);

  const [cmd, ...rest] = input.toLowerCase().split(/\s+/);
  const arg = rest.join(" ");

  if (/^\d+$/.test(cmd) && rest.length === 0) {
    const item = itemsFor(ctx.view, ctx)[Number(cmd) - 1];
    return item ? run(item.command, ctx) : error(input, `no option ${cmd} here.`);
  }

  if (INTRO.has(cmd)) return show(input, { type: "intro" });
  if (HELP.has(cmd)) return show(input, { type: "help" });
  if (cmd === "clear" || cmd === "cls") return { entry: null, effects: [{ type: "clear" }] };
  if (cmd === "back") return show(input, back(ctx.view));
  if (cmd === "ls" || cmd === "dir") return show(input, { type: "projects" });
  if (cmd === "cat" && /^about(\.txt|\.md)?$/.test(arg)) return show(input, { type: "about" });
  if (SECTIONS.includes(cmd)) return show(input, { type: cmd });

  if (cmd === "cd") {
    const target = resolveCd(arg);
    if (target === "back") return show(input, back(ctx.view));
    if (target?.type === "open") return run(`open ${target.slug}`, ctx);
    return target ? show(input, target) : error(input, `cd: no such directory: ${arg}`);
  }

  if (cmd === "open") {
    if (!arg) return error(input, "usage: open <number|name>. Try 'projects'.");
    const project = findProject(arg, ctx.projects);
    return project
      ? show(input, { type: "project", slug: project.slug })
      : error(input, `no such project: ${arg}. Try 'projects'.`);
  }

  if (cmd === "repo" || cmd === "demo") {
    const project = arg ? findProject(arg, ctx.projects) : currentProject(ctx);
    if (!project) return error(input, `usage: ${cmd} <number|name>. Try 'projects'.`);
    if (cmd === "repo") return open(input, project.repo);
    return project.demo ? open(input, project.demo) : error(input, `no live site for ${project.title}.`);
  }

  if (cmd === "github" || cmd === "linkedin" || cmd === "email") {
    const value = ctx.links[cmd];
    if (!value) return error(input, `no ${cmd} listed. Try 'contact'.`);
    return open(input, cmd === "email" ? `mailto:${value}` : value);
  }

  if (cmd === "theme") {
    const next = arg || THEMES[(THEMES.indexOf(ctx.theme) + 1) % THEMES.length];
    if (!THEMES.includes(next)) return error(input, `unknown theme: ${arg}. Themes: ${THEMES.join(", ")}.`);
    return { entry: { input, view: { type: "text", lines: [`theme set to ${next}`] } }, effects: [{ type: "theme", theme: next }] };
  }

  if (cmd === "sudo") return error(input, "permission denied. This incident will be reported.");

  return error(input, `command not found: ${cmd}. Type 'help'.`);
}

// Selectable options shown under a view; each runs a command.
export function itemsFor(view, ctx) {
  if (!view) return [];
  const menu = { label: "menu", hint: "back to the start", command: "menu" };
  switch (view.type) {
    case "intro":
      return SECTIONS.map((s) => ({ label: s, hint: SECTION_HINTS[s], command: s }));
    case "projects":
      return ctx.projects.map((p) => ({
        label: p.title,
        hint: p.stack ? `${p.year}  ${p.stack.join(" / ")}` : undefined,
        command: `open ${p.slug}`,
      }));
    case "project": {
      const p = ctx.projects.find((x) => x.slug === view.slug);
      if (!p) return [menu];
      return [
        { label: "repo", hint: "open on GitHub", command: `repo ${p.slug}` },
        p.demo && { label: "demo", hint: "open live site", command: `demo ${p.slug}` },
        { label: "back", hint: "all projects", command: "back" },
      ].filter(Boolean);
    }
    case "contact": {
      const { github, linkedin, email } = ctx.links;
      return [
        github && { label: "github", hint: github.replace(/^https?:\/\//, ""), command: "github" },
        linkedin && { label: "linkedin", hint: linkedin.replace(/^https?:\/\/(www\.)?/, ""), command: "linkedin" },
        email && { label: "email", hint: email, command: "email" },
        menu,
      ].filter(Boolean);
    }
    case "about":
    case "experience":
    case "education":
    case "stack":
      return [{ label: NEXT[view.type], hint: SECTION_HINTS[NEXT[view.type]], command: NEXT[view.type] }, menu];
    case "help":
      return [menu];
    case "error":
      return [{ label: "help", hint: "list commands", command: "help" }, menu];
    default:
      return [];
  }
}

export function pathFor(view) {
  if (!view || view.type === "intro" || !["project", ...SECTIONS].includes(view.type)) return "~";
  return view.type === "project" ? `~/projects/${view.slug}` : `~/${view.type}`;
}

export function complete(prefix) {
  if (!prefix) return null;
  const matches = COMMAND_NAMES.filter((c) => c.startsWith(prefix.toLowerCase()));
  return matches.length === 1 ? matches[0] : null;
}
