import { MagnifyingGlass, Moon, Sun } from "@phosphor-icons/react";
import { SECTIONS } from "../lib/sections";

const initials = (name) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLowerCase();

export default function StatusBar({ profile, theme, onToggleTheme, onOpenPalette }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-mono text-sm">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-accent text-xs font-semibold text-accent-ink"
          >
            {initials(profile.name)}
          </span>
          <span>{profile.handle}</span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-5 font-mono text-sm text-muted md:flex">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="transition-colors duration-150 hover:text-fg">
              /{s.id}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex h-9 items-center gap-2 rounded-md border border-line px-3 font-mono text-xs text-muted transition-[color,transform] duration-150 ease-out-quint hover:text-fg active:scale-[0.97]"
          >
            <MagnifyingGlass size={14} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Search</span>
            <kbd className="hidden rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[11px] sm:inline">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full border border-line text-muted transition-[color,transform] duration-150 ease-out-quint hover:text-fg active:scale-[0.94]"
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
