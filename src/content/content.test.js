import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { it, expect } from "vitest";
import { loadContent } from "./parse.js";

const root = join(import.meta.dirname, "../../content");

it("the real content/ files are valid", () => {
  const dir = join(root, "projects");
  const projectFiles = Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => [`projects/${f}`, readFileSync(join(dir, f), "utf8")])
  );
  const content = loadContent({
    profileRaw: readFileSync(join(root, "profile.yaml"), "utf8"),
    experienceRaw: readFileSync(join(root, "experience.yaml"), "utf8"),
    projectFiles,
  });
  expect(content.projects.length).toBeGreaterThan(0);
  // House style: no en or em dashes in visible copy.
  expect(JSON.stringify(content)).not.toMatch(/[–—]/);
});
