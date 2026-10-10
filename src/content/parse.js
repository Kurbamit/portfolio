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
    (a, b) =>
      Number(b.featured) - Number(a.featured) || b.year - a.year || a.title.localeCompare(b.title)
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
      if (typeof hop?.ms !== "number" || !(hop.ms > 0)) {
        fail(f, `"trace[${i}].ms" must be a positive number`);
      }
      return {
        name: text(f, hop.name, `trace[${i}].name`, { required: true }),
        ms: hop.ms,
        note: text(f, hop.note, `trace[${i}].note`),
      };
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

// Pure entry point: raw file contents in, validated content out.
// `projectFiles` maps any path ending in `<slug>.md` to its raw text.
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
