import { join } from "node:path";
import { it, expect } from "vitest";
import { readContent } from "./read.js";

it("the real content/ files are valid", () => {
  const content = readContent(join(import.meta.dirname, "../../content"));
  expect(content.projects.length).toBeGreaterThan(0);
  // House style: no en or em dashes in visible copy.
  expect(JSON.stringify(content)).not.toMatch(/[–—]/);
});
