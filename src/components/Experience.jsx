import { Briefcase, Flag, GraduationCap } from "@phosphor-icons/react";
import Section from "./Section";

const ICONS = { work: Briefcase, education: GraduationCap, milestone: Flag };

export default function Experience({ experience }) {
  return (
    <Section id="experience">
      <ol className="ml-3 mt-12 border-l border-line">
        {experience.map((item, i) => {
          const Icon = ICONS[item.kind];
          return (
            <li key={`${item.period}-${item.title}`} className="relative pb-12 pl-9 last:pb-0 md:grid md:grid-cols-[9rem_1fr] md:gap-8">
              <span
                aria-hidden="true"
                className={`absolute -left-3 top-0 grid size-6 place-items-center rounded-md border border-line bg-bg ${i === 0 ? "text-accent" : "text-muted"}`}
              >
                <Icon size={13} />
              </span>
              <p className="font-mono text-sm leading-6 tabular-nums text-muted">{item.period}</p>
              <div className="mt-1 md:mt-0">
                <h3 className="text-lg font-medium leading-6 tracking-tight">
                  {item.title}
                  {item.org && <span className="font-normal text-muted"> at {item.org}</span>}
                </h3>
                {item.summary && <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{item.summary}</p>}
                {item.tags.length > 0 && (
                  <p className="mt-3 font-mono text-xs text-muted">{item.tags.join(" / ")}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
