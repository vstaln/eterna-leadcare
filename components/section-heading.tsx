export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">{title}</h2>
    </div>
  );
}
