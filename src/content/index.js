import profileRaw from "../../content/profile.yaml?raw";
import experienceRaw from "../../content/experience.yaml?raw";
import { loadContent } from "./parse.js";

// Every Markdown file in content/projects/ becomes a project. Bundled at build time.
const projectFiles = import.meta.glob("../../content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const { profile, experience, projects } = loadContent({ profileRaw, experienceRaw, projectFiles });
