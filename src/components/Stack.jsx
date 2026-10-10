import { Sparkle } from "@phosphor-icons/react";
import Section from "./Section";

// Literal class names so Tailwind can see them.
const LG_COLS = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

export default function Stack({ skills }) {
  if (skills.length === 0) return null;
  const cols = LG_COLS[Math.min(skills.length, 4)];

  return (
    <Section id="stack">
      <div
        className={`mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 ${cols}`}
      >
        {skills.map(({ group, items }) => {
          const ai = group.toLowerCase() === "ai";
          return (
            <div
              key={group}
              className={`min-h-44 p-6 ${ai ? "bg-[color-mix(in_oklab,var(--accent)_9%,var(--bg))]" : "bg-bg"}`}
            >
              <h3 className={`flex items-center gap-2 font-mono text-sm ${ai ? "text-accent" : "text-muted"}`}>
                {ai && <Sparkle size={14} weight="fill" aria-hidden="true" />}
                {group}
              </h3>
              <ul className="mt-4 leading-8">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
