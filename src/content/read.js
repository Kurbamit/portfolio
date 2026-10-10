import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadContent } from "./parse.js";

// Node-only: reads and validates everything in the content/ directory.
export function readContent(root) {
  const dir = join(root, "projects");
  const projectFiles = Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => [join(dir, f), readFileSync(join(dir, f), "utf8")])
  );
  return loadContent({
    profileRaw: readFileSync(join(root, "profile.yaml"), "utf8"),
    experienceRaw: readFileSync(join(root, "experience.yaml"), "utf8"),
    projectFiles,
  });
}
