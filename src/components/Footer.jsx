import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

export default function Footer({ profile, sourceUrl }) {
  const { github, linkedin, email } = profile.links;
  const links = [
    { href: github, label: "GitHub", Icon: GithubLogo },
    linkedin && { href: linkedin, label: "LinkedIn", Icon: LinkedinLogo },
    email && { href: `mailto:${email}`, label: "Email", Icon: EnvelopeSimple },
  ].filter(Boolean);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div>
          <p className="max-w-[20ch] text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Building something on the backend?
          </p>
          <p className="mt-3 text-muted">
            {linkedin ? "The fastest way to reach me is LinkedIn." : "Find me on GitHub."}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {links.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="flex h-10 items-center gap-2 rounded-md border border-line px-4 font-mono text-sm transition-[background-color,transform] duration-150 ease-out-quint hover:bg-raised active:scale-[0.97]"
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 pb-8 font-mono text-xs text-muted md:px-8">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="hover:text-fg">
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
