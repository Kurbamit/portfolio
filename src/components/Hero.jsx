import { ArrowDown, GithubLogo } from "@phosphor-icons/react";
import RequestTrace from "./RequestTrace";

export default function Hero({ profile }) {
  return (
    <section
      aria-label="Introduction"
      className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 md:px-8 md:pt-24 lg:grid-cols-[1.3fr_1fr] lg:gap-14"
    >
      <div>
        <p data-enter style={{ "--i": 0 }} className="font-mono text-sm text-muted">
          {profile.role}
        </p>
        <h1
          data-enter
          style={{ "--i": 1 }}
          className="mt-5 text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-6xl lg:text-[3.25rem] xl:text-[3.5rem]"
        >
          {profile.headline}
          {profile.headlineAccent && <span className="block text-muted">{profile.headlineAccent}</span>}
        </h1>
        <p data-enter style={{ "--i": 2 }} className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
          {profile.tagline}
        </p>
        <div data-enter style={{ "--i": 3 }} className="mt-9 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="flex h-11 items-center gap-2 rounded-md bg-accent px-5 font-medium text-accent-ink transition-transform duration-150 ease-out-quint active:scale-[0.97]"
          >
            See projects
            <ArrowDown size={16} weight="bold" aria-hidden="true" />
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-11 items-center gap-2 rounded-md border border-line px-5 font-medium transition-[background-color,transform] duration-150 ease-out-quint hover:bg-raised active:scale-[0.97]"
          >
            <GithubLogo size={18} aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>

      <div data-enter style={{ "--i": 4 }}>
        <RequestTrace
          trace={profile.trace}
          role={profile.role}
          location={profile.location}
          focus={profile.focus}
        />
      </div>
    </section>
  );
}
