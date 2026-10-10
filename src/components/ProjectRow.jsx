import { ArrowUpRight, CaretDown, Star } from "@phosphor-icons/react";
import { assetUrl } from "../lib/assets";

function Status({ status }) {
  const running = status !== "archived";
  return (
    <span className={`inline-flex items-center gap-1.5 ${running ? "text-accent" : "text-muted"}`}>
      {running && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
      {status}
    </span>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 font-mono text-sm transition-[background-color,transform] duration-150 ease-out-quint hover:bg-raised active:scale-[0.97]"
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export default function ProjectRow({ project, open, onToggle }) {
  const { slug, title, stack, year, status, featured, description, repo, demo, image } = project;
  const panelId = `project-${slug}`;

  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-2 py-5 text-left transition-colors duration-150 hover:bg-raised/60 md:grid-cols-[6rem_1fr_auto_3.5rem_1.25rem]"
        >
          <span className="hidden font-mono text-xs md:block">
            <Status status={status} />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-lg font-medium tracking-tight md:text-xl">
              {title}
              {featured && (
                <>
                  <Star size={13} weight="fill" className="shrink-0 text-accent" aria-hidden="true" />
                  <span className="sr-only">(featured)</span>
                </>
              )}
            </span>
            <span className="mt-1 flex gap-3 font-mono text-xs text-muted md:hidden">
              <Status status={status} />
              <span className="tabular-nums">{year}</span>
            </span>
          </span>
          <span className="hidden font-mono text-xs text-muted md:block">{stack.join(" / ")}</span>
          <span className="hidden text-right font-mono text-sm tabular-nums text-muted md:block">{year}</span>
          <CaretDown
            size={16}
            aria-hidden="true"
            className={`text-muted transition-transform duration-200 ease-out-quint ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>

      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out-quint ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div
            className={`grid gap-6 px-2 pb-8 transition-opacity duration-200 md:grid-cols-[1fr_minmax(0,20rem)] md:pl-[7.5rem] ${open ? "opacity-100" : "opacity-0"}`}
          >
            <div>
              <p className="max-w-[60ch] leading-relaxed text-muted">{description}</p>
              <p className="mt-4 font-mono text-xs text-muted md:hidden">{stack.join(" / ")}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ExternalLink href={repo}>Repository</ExternalLink>
                {demo && <ExternalLink href={demo}>Live site</ExternalLink>}
              </div>
            </div>
            {image && (
              <img
                src={assetUrl(image)}
                alt={`${title} screenshot`}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-md border border-line object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
