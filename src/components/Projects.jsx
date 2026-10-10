import { useState } from "react";
import Section from "./Section";
import ProjectRow from "./ProjectRow";

export default function Projects({ projects }) {
  const [openSlug, setOpenSlug] = useState(projects[0]?.slug ?? null);

  return (
    <Section id="projects" count={projects.length}>
      <p className="mt-4 max-w-[52ch] text-muted">Side projects and team builds. Open a row for details and the repo.</p>
      {projects.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted">No projects yet. Add a file to content/projects/.</p>
      ) : (
        <ul className="mt-10 border-t border-line">
          {projects.map((p) => (
            <ProjectRow
              key={p.slug}
              project={p}
              open={openSlug === p.slug}
              onToggle={() => setOpenSlug((s) => (s === p.slug ? null : p.slug))}
            />
          ))}
        </ul>
      )}
    </Section>
  );
}
