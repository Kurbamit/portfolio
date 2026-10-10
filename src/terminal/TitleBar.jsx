import { Palette } from "@phosphor-icons/react";

export default function TitleBar({ path, theme, onTheme }) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-3 border-b border-line px-4">
      <span aria-hidden="true" className="hidden gap-1.5 md:flex">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-3 rounded-full border border-line bg-fg/15" />
        ))}
      </span>
      <h1 className="min-w-0 flex-1 truncate text-center text-xs text-dim md:text-sm">
        dominykas@portfolio: {path}
      </h1>
      <button
        type="button"
        onClick={(e) => {
          e.currentTarget.blur();
          onTheme();
        }}
        aria-label={`Theme: ${theme}. Switch theme`}
        className="flex h-8 items-center gap-1.5 rounded-sm border border-line px-2 text-xs transition-transform duration-150 hover:bg-fg/10 active:scale-[0.97]"
      >
        <Palette size={14} aria-hidden="true" />
        {theme}
      </button>
    </header>
  );
}
