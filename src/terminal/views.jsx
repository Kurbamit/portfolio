import { assetUrl } from "../lib/assets";

const HELP = [
  ["whoami", "intro and main menu"],
  ["about", "who I am"],
  ["projects", "list projects (ls)"],
  ["open <n|name>", "project details"],
  ["repo [n|name]", "open a project on GitHub"],
  ["demo [n|name]", "open a project's live site"],
  ["experience", "where I've worked"],
  ["stack", "tools I use"],
  ["contact", "where to find me"],
  ["theme [name]", "green, amber or light"],
  ["back", "go up one level (cd ..)"],
  ["clear", "clear the screen"],
];

const KEYS = [
  ["↑ ↓  j k", "move"],
  ["enter", "open"],
  ["1-9", "pick an option"],
  ["esc", "back"],
  ["/", "type a command"],
];

export function Options({ items, active, interactive, onRun }) {
  if (items.length === 0) return null;
  const labelWidth = Math.max(...items.map((i) => i.label.length)) + 2;

  return (
    <ul className="mt-3 -mx-2" style={{ "--label": `${labelWidth}ch` }}>
      {items.map((item, i) => {
        const on = interactive && i === active;
        return (
          <li key={item.command}>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onRun(item.command);
              }}
              aria-current={on || undefined}
              className={`grid min-h-11 w-full grid-cols-[2ch_4ch_1fr] items-center px-2 text-left md:min-h-8 md:grid-cols-[2ch_4ch_var(--label)_1fr] ${
                on ? "bg-sel text-sel-ink [text-shadow:none]" : "hover:bg-fg/10"
              }`}
            >
              <span aria-hidden="true">{on ? ">" : ""}</span>
              <span className={on ? "" : "text-dim"}>[{i + 1}]</span>
              <span className="truncate">{item.label}</span>
              {item.hint && (
                <span className={`col-start-3 truncate whitespace-pre text-xs md:col-start-4 md:text-sm ${on ? "" : "text-dim"}`}>
                  {item.hint}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Intro({ profile }) {
  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold tracking-tight md:text-3xl">{profile.name}</p>
      <p className="text-dim">
        {profile.role}
        {profile.location && `, ${profile.location}`}
      </p>
      <p className="pt-3">
        {profile.headline} {profile.headlineAccent}
      </p>
      <p className="max-w-[70ch] text-dim">{profile.tagline}</p>
      <p className="pt-3 text-dim">Pick a section below, or type &apos;help&apos;.</p>
    </div>
  );
}

function About({ profile }) {
  const facts = [
    ["now", profile.currently],
    ["based", profile.location],
    ["focus", profile.focus.join(", ")],
  ].filter(([, v]) => v);

  return (
    <div>
      <p className="max-w-[70ch]">{profile.bio}</p>
      <dl className="mt-4 grid grid-cols-[8ch_1fr] gap-y-1">
        {facts.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-dim">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Projects({ projects }) {
  return (
    <p className="text-dim">
      {projects.length} project{projects.length === 1 ? "" : "s"}. Open one for details.
    </p>
  );
}

function Project({ project }) {
  if (!project) return <p>error: project not found.</p>;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xl font-semibold">{project.title}</p>
        <p className="whitespace-pre-wrap text-dim">
          {project.year}  {project.status}
          {project.featured && "  featured"}
        </p>
      </div>
      <p className="text-dim">stack: {project.stack.join(" / ")}</p>
      <p className="max-w-[70ch]">{project.description}</p>
      {project.image && (
        <div className="project-shot max-w-md overflow-hidden border border-line">
          <img src={assetUrl(project.image)} alt={`${project.title} screenshot`} loading="lazy" className="block w-full" />
        </div>
      )}
    </div>
  );
}

function Experience({ experience }) {
  return (
    <ol className="space-y-4">
      {experience.map((item) => (
        <li key={`${item.period}-${item.title}`} className="grid gap-x-4 md:grid-cols-[14ch_1fr]">
          <span className="text-dim">{item.period}</span>
          <div>
            <p>
              {item.title}
              {item.org && <span className="text-dim"> @ {item.org}</span>}
            </p>
            {item.summary && <p className="max-w-[70ch] text-dim">{item.summary}</p>}
            {item.tags.length > 0 && <p className="text-xs text-dim md:text-sm">[{item.tags.join(", ")}]</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Stack({ skills }) {
  return (
    <div className="grid gap-x-10 gap-y-4 whitespace-pre sm:grid-cols-2">
      {skills.map(({ group, items }) => (
        <div key={group}>
          <p>{group}/</p>
          {items.map((item, i) => (
            <p key={item}>
              <span className="text-dim">{i === items.length - 1 ? "└── " : "├── "}</span>
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function Contact({ profile }) {
  return (
    <p className="max-w-[70ch] text-dim">
      {profile.links.linkedin
        ? "No contact form here. LinkedIn is the fastest way to reach me."
        : "No contact form here. Find me on GitHub."}
    </p>
  );
}

function Help() {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[minmax(0,16ch)_1fr] gap-x-4 gap-y-0.5">
        {HELP.map(([cmd, desc]) => (
          <div key={cmd} className="contents">
            <dt className="truncate">{cmd}</dt>
            <dd className="text-dim">{desc}</dd>
          </div>
        ))}
      </dl>
      <p className="hidden text-dim md:block">
        keys: {KEYS.map(([k, d]) => `${k} ${d}`).join(",  ")}
      </p>
    </div>
  );
}

export function View({ view, content }) {
  const { profile, experience, projects } = content;
  switch (view.type) {
    case "intro":
      return <Intro profile={profile} />;
    case "about":
      return <About profile={profile} />;
    case "projects":
      return <Projects projects={projects} />;
    case "project":
      return <Project project={projects.find((p) => p.slug === view.slug)} />;
    case "experience":
      return <Experience experience={experience} />;
    case "stack":
      return <Stack skills={profile.skills} />;
    case "contact":
      return <Contact profile={profile} />;
    case "help":
      return <Help />;
    case "error":
      return <p>{view.message}</p>;
    case "text":
      return view.lines.map((line) => (
        <p key={line} className="text-dim">
          {line}
        </p>
      ));
    default:
      return null;
  }
}
