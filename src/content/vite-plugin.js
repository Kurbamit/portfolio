import { resolve } from "node:path";
import { readContent } from "./read.js";

const ID = "virtual:content";
const RESOLVED = "\0" + ID;

// Parses and validates content/ at build time and exposes it as plain JSON,
// so the YAML parser never ships to the browser and bad content fails the build.
export default function contentPlugin({ dir = "content" } = {}) {
  let root;
  return {
    name: "portfolio-content",
    configResolved(config) {
      root = resolve(config.root, dir);
    },
    resolveId(id) {
      if (id === ID) return RESOLVED;
    },
    load(id) {
      if (id !== RESOLVED) return;
      const content = readContent(root);
      return Object.entries(content)
        .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
        .join("\n");
    },
    configureServer(server) {
      server.watcher.add(root);
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(root)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}
