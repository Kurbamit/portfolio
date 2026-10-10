import { describe, it, expect } from "vitest";
import { run, itemsFor, pathFor, complete, THEMES } from "./commands.js";

const projects = [
  { slug: "point-of-sale", title: "Point of Sale", repo: "https://github.com/x/pos", demo: null },
  { slug: "portfolio", title: "This portfolio", repo: "https://github.com/x/portfolio", demo: "https://x.dev" },
  { slug: "trello-clone", title: "Trello Clone", repo: "https://github.com/x/trello", demo: null },
];
const links = { github: "https://github.com/d", linkedin: "https://linkedin.com/in/d", email: null };
const ctx = (over = {}) => ({ projects, links, theme: "green", view: null, ...over });
const view = (input, c) => run(input, ctx(c)).entry.view;

describe("run: navigation", () => {
  it.each([
    ["whoami", "intro"],
    ["menu", "intro"],
    ["cd", "intro"],
    ["cd ~", "intro"],
    ["about", "about"],
    ["cat about.txt", "about"],
    ["projects", "projects"],
    ["ls", "projects"],
    ["ls -la", "projects"],
    ["cd projects", "projects"],
    ["experience", "experience"],
    ["education", "education"],
    ["cd education", "education"],
    ["stack", "stack"],
    ["contact", "contact"],
    ["help", "help"],
    ["?", "help"],
    ["  PROJECTS  ", "projects"],
  ])("%s -> %s", (input, type) => {
    expect(view(input).type).toBe(type);
  });

  it("records the raw input on the entry", () => {
    expect(run("ls", ctx()).entry.input).toBe("ls");
  });

  it("empty input prints an empty prompt line", () => {
    expect(run("   ", ctx())).toEqual({ entry: { input: "", view: null }, effects: [] });
  });

  it("back goes from a project to the list, otherwise to the menu", () => {
    expect(view("cd ..", { view: { type: "project", slug: "portfolio" } }).type).toBe("projects");
    expect(view("back", { view: { type: "stack" } }).type).toBe("intro");
  });

  it("unknown commands explain themselves", () => {
    expect(view("rm -rf /")).toEqual({ type: "error", message: "command not found: rm. Type 'help'." });
  });

  it("sudo is denied", () => {
    expect(view("sudo hire me").type).toBe("error");
  });
});

describe("run: projects", () => {
  it.each([
    ["open 2", "portfolio"],
    ["open trello-clone", "trello-clone"],
    ["open point", "point-of-sale"],
    ["open trello", "trello-clone"],
    ["cd projects/portfolio", "portfolio"],
  ])("%s opens %s", (input, slug) => {
    expect(view(input)).toEqual({ type: "project", slug });
  });

  it("reports unknown projects", () => {
    expect(view("open nope")).toEqual({ type: "error", message: "no such project: nope. Try 'projects'." });
    expect(view("open").type).toBe("error");
  });

  it("repo opens the current project's repository", () => {
    const res = run("repo", ctx({ view: { type: "project", slug: "trello-clone" } }));
    expect(res.effects).toEqual([{ type: "open", url: "https://github.com/x/trello" }]);
    expect(res.entry.view.type).toBe("text");
  });

  it("demo errors when there is no live site", () => {
    expect(run("demo 1", ctx()).effects).toEqual([]);
    expect(view("demo 1").message).toMatch(/no live site/);
    expect(run("demo portfolio", ctx()).effects).toEqual([{ type: "open", url: "https://x.dev" }]);
  });
});

describe("run: links, theme, clear, numbers", () => {
  it("opens links and errors on missing ones", () => {
    expect(run("github", ctx()).effects).toEqual([{ type: "open", url: "https://github.com/d" }]);
    expect(view("email").type).toBe("error");
  });

  it("theme cycles or sets", () => {
    expect(run("theme", ctx({ theme: "light" })).effects).toEqual([{ type: "theme", theme: THEMES[0] }]);
    expect(run("theme amber", ctx()).effects).toEqual([{ type: "theme", theme: "amber" }]);
    expect(view("theme pink").message).toMatch(/green, amber, light/);
  });

  it("clear has no entry", () => {
    expect(run("clear", ctx())).toEqual({ entry: null, effects: [{ type: "clear" }] });
  });

  it("a number runs that option of the current menu", () => {
    const res = run("2", ctx({ view: { type: "intro" } }));
    expect(res.entry).toEqual({ input: "projects", view: { type: "projects" } });
    expect(view("9", { view: { type: "intro" } }).type).toBe("error");
  });
});

describe("itemsFor / pathFor / complete", () => {
  it("menu lists the sections", () => {
    expect(itemsFor({ type: "intro" }, ctx()).map((i) => i.command)).toEqual([
      "about",
      "projects",
      "experience",
      "education",
      "stack",
      "contact",
    ]);
  });

  it("project options include demo only when present", () => {
    const cmds = (slug) => itemsFor({ type: "project", slug }, ctx()).map((i) => i.command);
    expect(cmds("portfolio")).toEqual(["repo portfolio", "demo portfolio", "back"]);
    expect(cmds("point-of-sale")).toEqual(["repo point-of-sale", "back"]);
  });

  it("contact skips missing links", () => {
    expect(itemsFor({ type: "contact" }, ctx()).map((i) => i.command)).toEqual(["github", "linkedin", "menu"]);
  });

  it("sections point to the next one", () => {
    const next = (type) => itemsFor({ type }, ctx())[0].command;
    expect(next("experience")).toBe("education");
    expect(next("education")).toBe("stack");
  });

  it("null view has no items", () => {
    expect(itemsFor(null, ctx())).toEqual([]);
  });

  it("paths follow the view", () => {
    expect(pathFor(null)).toBe("~");
    expect(pathFor({ type: "intro" })).toBe("~");
    expect(pathFor({ type: "stack" })).toBe("~/stack");
    expect(pathFor({ type: "project", slug: "portfolio" })).toBe("~/projects/portfolio");
  });

  it("completes unique command names only", () => {
    expect(complete("exp")).toBe("experience");
    expect(complete("edu")).toBe("education");
    expect(complete("pro")).toBe("projects");
    expect(complete("c")).toBe(null);
    expect(complete("")).toBe(null);
  });
});
