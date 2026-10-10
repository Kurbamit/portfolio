import { useCallback, useEffect, useRef, useState } from "react";
import { profile, experience, projects } from "../content";
import { useTheme } from "../lib/theme";
import { run, itemsFor, pathFor } from "./commands";
import { View, Options } from "./views";
import Prompt, { PromptLabel } from "./Prompt";
import TitleBar from "./TitleBar";

const content = { profile, experience, projects };
const BOOT_LINES = ["mounted /content", `loaded ${projects.length} projects`, "shell ready"];
const SHORTCUTS = ["help", "projects", "contact", "theme", "clear"];

let nextId = 0;

function shouldBoot() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return !sessionStorage.getItem("booted");
  } catch {
    return false;
  }
}

function markBooted() {
  try {
    sessionStorage.setItem("booted", "1");
  } catch {
    // Storage unavailable; the boot just plays again next visit.
  }
}

// Where the visitor "is": the newest entry that navigated somewhere.
function findLocation(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const view = entries[i].view;
    if (view && view.type !== "text") return i;
  }
  return -1;
}

function openUrl(url) {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}

export default function Terminal() {
  const [theme, setTheme] = useTheme();
  const [booting, setBooting] = useState(shouldBoot);
  const [bootCount, setBootCount] = useState(() => (booting ? 0 : BOOT_LINES.length));
  const [entries, setEntries] = useState(() => {
    if (booting) return [];
    const { entry } = run("whoami", { projects, links: profile.links, theme, view: null });
    return [{ ...entry, id: nextId++, path: "~" }];
  });
  const [active, setActive] = useState(0);
  const [history, setHistory] = useState([]);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const freshRef = useRef(null);

  const locationIndex = findLocation(entries);
  const location = locationIndex >= 0 ? entries[locationIndex].view : null;
  const ctx = { projects, links: profile.links, theme, view: location };
  const items = itemsFor(location, ctx);
  const path = pathFor(location);
  // Entries from the current location onward are "fresh"; everything before is faded history.
  const freshStart = locationIndex >= 0 ? locationIndex : Math.max(entries.length - 1, 0);

  const exec = useCallback(
    (input) => {
      const { entry, effects } = run(input, { projects, links: profile.links, theme, view: location });
      let cleared = false;
      for (const fx of effects) {
        if (fx.type === "clear") cleared = true;
        else if (fx.type === "theme") setTheme(fx.theme);
        else if (fx.type === "open") openUrl(fx.url);
      }
      const next = entry && { ...entry, id: nextId++, path: pathFor(location) };
      setEntries((list) => {
        const base = cleared ? [] : list;
        return next ? [...base, next] : base;
      });
      if (cleared) setBootCount(0);
      if (entry?.view && entry.view.type !== "text") setActive(0);
      const trimmed = input.trim();
      if (trimmed) setHistory((h) => (h[h.length - 1] === trimmed ? h : [...h, trimmed]));
    },
    [location, theme, setTheme]
  );

  const finishBoot = useCallback(() => {
    if (!booting) return;
    markBooted();
    setBooting(false);
    setBootCount(BOOT_LINES.length);
    exec("whoami");
  }, [booting, exec]);

  // Boot sequence: one line every 130ms, then run whoami.
  useEffect(() => {
    if (!booting) return;
    const done = bootCount >= BOOT_LINES.length;
    const timer = setTimeout(done ? finishBoot : () => setBootCount((c) => c + 1), done ? 220 : 130);
    return () => clearTimeout(timer);
  }, [booting, bootCount, finishBoot]);

  // Start the newest output at the top of the screen; older output stays above, faded.
  useEffect(() => {
    const scroller = scrollRef.current;
    const fresh = freshRef.current;
    if (!scroller || !fresh) return;
    scroller.scrollTop = fresh.offsetTop - parseFloat(getComputedStyle(scroller).paddingTop);
  }, [entries, bootCount]);

  // Keep the highlighted option visible while moving through a long list.
  useEffect(() => {
    scrollRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (booting) {
        finishBoot();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.target === inputRef.current) return;
      const onControl = e.target instanceof Element && e.target.closest("button, a, input");
      const count = items.length;
      const pick = (item) => {
        if (!item) return;
        e.preventDefault();
        exec(item.command);
      };

      if ((e.key === "ArrowDown" || e.key === "j") && count) {
        e.preventDefault();
        setActive((a) => (a + 1) % count);
      } else if ((e.key === "ArrowUp" || e.key === "k") && count) {
        e.preventDefault();
        setActive((a) => (a - 1 + count) % count);
      } else if (e.key === "Enter" && !onControl) {
        pick(items[Math.min(active, count - 1)]);
      } else if (/^[1-9]$/.test(e.key)) {
        pick(items[Number(e.key) - 1]);
      } else if ((e.key === "Escape" || e.key === "Backspace") && location?.type !== "intro") {
        e.preventDefault();
        exec("back");
      } else if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        // Focus the prompt; the typed character lands in it.
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [booting, finishBoot, items, active, exec, location]);

  return (
    <div className="flex h-[100dvh] md:items-center md:justify-center md:p-8" onPointerDown={booting ? finishBoot : undefined}>
      <div className="scanlines glow relative flex h-full w-full flex-col overflow-hidden bg-bg md:h-[min(54rem,calc(100dvh-4rem))] md:max-w-5xl md:rounded-md md:border md:border-line md:shadow-[0_30px_80px_rgb(0_0_0/0.45)]">
        <TitleBar path={path} theme={theme} onTheme={() => exec("theme")} />

        <main
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-[13.5px] leading-6 md:px-6 md:text-sm"
        >
          {freshStart > 0 && (
            <div className="opacity-40 transition-opacity duration-300 hover:opacity-75">
              <BootLines count={bootCount} />
              {entries.slice(0, freshStart).map((entry) => (
                <Entry key={entry.id} entry={entry} ctx={ctx} active={active} interactive={false} onRun={exec} />
              ))}
            </div>
          )}

          <div ref={freshRef} className="min-h-full">
            {freshStart > 0 ? (
              <hr aria-hidden="true" className="mb-5 border-0 border-t border-dashed border-line" />
            ) : (
              <BootLines count={bootCount} />
            )}
            {entries.slice(freshStart).map((entry, i) => (
              <Entry
                key={entry.id}
                entry={entry}
                ctx={ctx}
                active={active}
                interactive={freshStart + i === locationIndex}
                onRun={exec}
              />
            ))}
            {!booting && entries.length > 0 && <KeyHint hasOptions={items.length > 0} />}
          </div>
        </main>

        <nav aria-label="Shortcuts" className="flex gap-2 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
          {SHORTCUTS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => exec(cmd)}
              className="h-9 shrink-0 rounded-sm border border-line px-3 text-sm active:bg-fg/10"
            >
              {cmd}
            </button>
          ))}
        </nav>

        <Prompt inputRef={inputRef} path={path} history={history} onSubmit={exec} />
      </div>
    </div>
  );
}

function BootLines({ count }) {
  if (count === 0) return null;
  return (
    <div className="mb-4 text-dim">
      {BOOT_LINES.slice(0, count).map((line) => (
        <p key={line}>
          [ <span className="text-fg">ok</span> ] {line}
        </p>
      ))}
    </div>
  );
}

function Entry({ entry, ctx, active, interactive, onRun }) {
  return (
    <section className="entry-in mb-6 last:mb-2">
      <p className="break-words">
        <PromptLabel path={entry.path} />
        {entry.input}
      </p>
      {entry.view && (
        <>
          <div className="mt-2">
            <View view={entry.view} content={content} />
          </div>
          <Options items={itemsFor(entry.view, ctx)} active={active} interactive={interactive} onRun={onRun} />
        </>
      )}
    </section>
  );
}

function KeyHint({ hasOptions }) {
  return (
    <p className="hidden whitespace-pre text-xs text-dim md:block">
      {hasOptions ? "↑↓ move   enter open   1-9 pick   esc back   / type a command" : "type a command, or 'help'"}
    </p>
  );
}
