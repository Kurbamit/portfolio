export default function SectionHeading({ id, count }) {
  return (
    <h2 id={`${id}-title`} className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
      <span className="text-accent">/</span>
      {id}
      {count != null && <span className="ml-3 align-middle text-base text-muted">({count})</span>}
    </h2>
  );
}
