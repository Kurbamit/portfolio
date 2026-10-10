import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  validateProject,
  validateProfile,
  validateExperience,
  sortProjects,
  loadContent,
  ContentError,
} from "./parse.js";

const project = (over = {}) => ({
  title: "Point of Sale",
  repo: "https://github.com/x/pos",
  stack: ["ASP.NET"],
  year: 2024,
  status: "archived",
  ...over,
});

describe("parseFrontmatter", () => {
  it("splits yaml data and markdown body", () => {
    const { data, body } = parseFrontmatter("---\ntitle: A\nyear: 2024\n---\nHello\n", "f.md");
    expect(data).toEqual({ title: "A", year: 2024 });
    expect(body).toBe("Hello");
  });

  it("throws with file name when frontmatter is missing", () => {
    expect(() => parseFrontmatter("no frontmatter", "content/projects/x.md")).toThrow(
      /content\/projects\/x\.md: missing frontmatter/
    );
  });
});

describe("validateProject", () => {
  it("normalizes a valid project", () => {
    expect(validateProject("pos", project(), "Desc")).toEqual({
      slug: "pos",
      title: "Point of Sale",
      repo: "https://github.com/x/pos",
      stack: ["ASP.NET"],
      year: 2024,
      status: "archived",
      featured: false,
      demo: null,
      image: null,
      description: "Desc",
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
  const base = {
    name: "D",
    role: "Eng",
    headline: "H",
    tagline: "T",
    bio: "B",
    links: { github: "https://github.com/d" },
  };

  it("applies defaults", () => {
    const p = validateProfile(base);
    expect(p.handle).toBe("D");
    expect(p.skills).toEqual([]);
    expect(p.trace).toEqual([]);
    expect(p.links).toEqual({ github: "https://github.com/d", linkedin: null, email: null });
  });

  it("turns skills map into ordered groups", () => {
    const p = validateProfile({ ...base, skills: { backend: ["C#"], ai: ["RAG"] } });
    expect(p.skills).toEqual([
      { group: "backend", items: ["C#"] },
      { group: "ai", items: ["RAG"] },
    ]);
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
    const md = (t, y) =>
      `---\ntitle: ${t}\nrepo: https://github.com/x/${t}\nstack: [Go]\nyear: ${y}\nstatus: active\n---\nBody`;
    const { projects } = loadContent({
      profileRaw: "name: D\nrole: E\nheadline: H\ntagline: T\nbio: B\nlinks:\n  github: https://github.com/d\n",
      experienceRaw: "[]",
      projectFiles: {
        "../../content/projects/old.md": md("old", 2020),
        "../../content/projects/new.md": md("new", 2025),
      },
    });
    expect(projects.map((p) => p.slug)).toEqual(["new", "old"]);
  });
});
