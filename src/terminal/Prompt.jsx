import { useState } from "react";
import { complete } from "./commands";

export function PromptLabel({ path }) {
  return (
    <span className="shrink-0 whitespace-pre">
      <span className="hidden text-dim sm:inline">dominykas@portfolio</span>
      <span className="text-dim sm:hidden">~</span>
      <span className="hidden sm:inline">:{path}</span>
      <span>$ </span>
    </span>
  );
}

export default function Prompt({ inputRef, path, history, onSubmit }) {
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(null);
  const [focused, setFocused] = useState(false);

  const recall = (index) => {
    setHistoryIndex(index);
    setValue(index === null ? "" : history[index]);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowUp" && history.length > 0) {
      e.preventDefault();
      recall(Math.max((historyIndex ?? history.length) - 1, 0));
    } else if (e.key === "ArrowDown" && historyIndex !== null) {
      e.preventDefault();
      recall(historyIndex + 1 < history.length ? historyIndex + 1 : null);
    } else if (e.key === "Tab") {
      const completion = complete(value.trim());
      if (completion) {
        e.preventDefault();
        setValue(`${completion} `);
      }
    } else if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
        setValue("");
        setHistoryIndex(null);
      }}
      className="flex items-center border-t border-line px-4 py-3 md:px-6"
    >
      <label htmlFor="prompt" className="flex min-w-0 flex-1 items-center">
        <PromptLabel path={path} />
        <span className="sr-only">Command</span>
        <span className="relative flex min-w-0 flex-1 items-center">
          <input
            id="prompt"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="w-full min-w-0 bg-transparent text-base caret-fg outline-none focus-visible:outline-none md:text-sm"
          />
          {!focused && value === "" && (
            <span aria-hidden="true" className="cursor pointer-events-none absolute left-0">
              █
            </span>
          )}
        </span>
      </label>
    </form>
  );
}
