import SectionHeading from "./SectionHeading";

export default function Section({ id, count, children, className = "" }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-reveal mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28 ${className}`}
    >
      <SectionHeading id={id} count={count} />
      {children}
    </section>
  );
}
