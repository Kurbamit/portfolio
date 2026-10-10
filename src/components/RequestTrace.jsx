import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

// Animation time per millisecond of (illustrative) latency.
const SCALE = 22;
const START_DELAY = 250;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function buildSpans(trace) {
  let start = 0;
  const spans = trace.map((hop) => {
    const span = { ...hop, start, delay: START_DELAY + start * SCALE, dur: clamp(hop.ms * SCALE, 180, 700) };
    start += hop.ms;
    return span;
  });
  const finish = spans.reduce((t, s) => Math.max(t, s.delay + s.dur), START_DELAY);
  return { spans, total: start, finish };
}

const pct = (n, total) => `${(n / total) * 100}%`;

function SpanRow({ name, note, ms, left, width, delay, dur, root = false }) {
  return (
    <li className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 sm:grid-cols-[10.5rem_1fr_3rem]">
      <span className={`truncate ${root ? "text-fg" : "text-muted"}`}>
        {root ? "" : "└ "}
        {name}
        {note && <span className="hidden text-muted/70 sm:inline"> {note}</span>}
      </span>
      <span className="relative h-2">
        <span
          className={`span-bar absolute inset-y-0 rounded-[2px] ${root ? "bg-fg/25" : "bg-accent"}`}
          style={{ left, width, "--delay": `${delay}ms`, "--dur": `${dur}ms` }}
        />
      </span>
      <span className="late-fade text-right tabular-nums text-muted" style={{ "--delay": `${delay + dur}ms` }}>
        {ms}ms
      </span>
    </li>
  );
}

export default function RequestTrace({ trace, role, location, focus }) {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const { spans, total, finish } = useMemo(() => buildSpans(trace), [trace]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setDone(true), reduce ? 0 : finish);
    return () => clearTimeout(timer);
  }, [run, finish]);

  const replay = () => {
    setDone(false);
    setRun((r) => r + 1);
  };

  const body = [
    ["role", role],
    location && ["based", location],
  ].filter(Boolean);

  return (
    <figure
      aria-label="Sample request trace"
      className="overflow-hidden rounded-md border border-line bg-raised font-mono text-[12.5px] leading-6 sm:text-[13px]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <span>
          <span className="text-accent">GET</span> /dominykas
        </span>
        <span
          className={`rounded-[4px] border border-accent/40 px-1.5 text-[11px] text-accent transition-opacity duration-200 ${done ? "opacity-100" : "opacity-0"}`}
        >
          200 OK
        </span>
        <figcaption className="ml-auto text-[11px] text-muted">sample trace</figcaption>
        <button
          type="button"
          onClick={replay}
          aria-label="Replay trace"
          className="-mr-1.5 grid size-7 place-items-center rounded-md text-muted transition-[color,transform] duration-150 ease-out-quint hover:text-fg active:scale-[0.92]"
        >
          <ArrowClockwise size={14} aria-hidden="true" />
        </button>
      </div>

      {total > 0 && (
        <ol key={run} className="space-y-2 px-4 py-4">
          <SpanRow
            root
            name="dominykas"
            ms={total}
            left="0%"
            width="100%"
            delay={START_DELAY}
            dur={finish - START_DELAY}
          />
          {spans.map((s) => (
            <SpanRow
              key={s.name}
              name={s.name}
              note={s.note}
              ms={s.ms}
              left={pct(s.start, total)}
              width={`max(${pct(s.ms, total)}, 3px)`}
              delay={s.delay}
              dur={s.dur}
            />
          ))}
        </ol>
      )}

      <pre
        className={`overflow-x-auto border-t border-line px-4 py-3 text-muted transition-opacity duration-300 ${done ? "opacity-100" : "opacity-40"}`}
      >
        {"{\n"}
        {body.map(([key, value]) => (
          <span key={key}>
            {"  "}"{key}": <span className="text-fg">"{value}"</span>,{"\n"}
          </span>
        ))}
        {focus.length > 0 && (
          <>
            {'  "focus": [\n'}
            {focus.map((f, i) => (
              <span key={f}>
                {"    "}
                <span className="text-fg">"{f}"</span>
                {i < focus.length - 1 ? "," : ""}
                {"\n"}
              </span>
            ))}
            {"  ]\n"}
          </>
        )}
        {"}"}
      </pre>
    </figure>
  );
}
