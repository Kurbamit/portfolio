import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

// Opened by keyboard many times a session, so it deliberately has no open/close animation.
export default function CommandPalette({ open, onClose, items }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((it) => `${it.label} ${it.hint ?? ""}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const reset = () => {
    setQuery("");
    setActive(0);
  };

  const run = (item) => {
    onClose();
    // Let the dialog close (and restore focus) before navigating.
    requestAnimationFrame(() => item.run());
  };

  const onKeyDown = (e) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[Math.min(active, results.length - 1)]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => {
        reset();
        onClose();
      }}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-line bg-raised p-0 text-fg backdrop:bg-black/55"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <MagnifyingGlass size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section, project or link"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
          className="h-12 w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <kbd className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">esc</kbd>
      </div>

      <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-6 text-center font-mono text-sm text-muted">No matches</li>}
        {results.map((item, i) => {
          const header = item.group !== results[i - 1]?.group ? item.group : null;
          return (
            <li key={item.id} role="presentation">
              {header && (
                <p aria-hidden="true" className="px-3 pb-1 pt-3 font-mono text-[11px] text-muted first:pt-1">
                  {header}
                </p>
              )}
              <div
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(item)}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 text-sm ${i === active ? "bg-bg" : ""}`}
              >
                <span>{item.label}</span>
                {item.hint && <span className="truncate font-mono text-xs text-muted">{item.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
