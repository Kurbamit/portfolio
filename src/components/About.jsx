import Section from "./Section";

export default function About({ profile }) {
  const facts = [
    profile.currently && ["now", profile.currently],
    profile.location && ["based", profile.location],
    profile.focus.length > 0 && ["focus", profile.focus],
  ].filter(Boolean);

  return (
    <Section id="about">
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_16rem] md:gap-16">
        <p className="max-w-[34ch] text-2xl leading-snug tracking-tight md:text-[2rem] md:leading-[1.3]">
          {profile.bio}
        </p>
        <dl className="space-y-6 font-mono text-sm">
          {facts.map(([term, value]) => (
            <div key={term}>
              <dt className="text-muted">{term}</dt>
              <dd className="mt-1">
                {Array.isArray(value)
                  ? value.map((v) => (
                      <span key={v} className="block">
                        {v}
                      </span>
                    ))
                  : value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
