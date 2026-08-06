const nodes = [
  { label: "Form", x: 80 },
  { label: "API", x: 240 },
  { label: "N8N", x: 400 },
  { label: "Apps Script", x: 560 },
  { label: "Report Card", x: 720 },
];

export default function PipelineDiagram() {
  return (
    <figure>
      <svg
        viewBox="0 0 800 160"
        className="h-auto w-full"
        role="img"
        aria-label="Pipeline diagram: Form, API, N8N, Apps Script, Report Card"
      >
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[i + 1];
          return (
            <line
              key={`${node.label}-${next.label}`}
              x1={node.x + 60}
              y1={80}
              x2={next.x - 60}
              y2={80}
              stroke="var(--color-border)"
              strokeWidth={1.5}
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.label}>
            <rect
              x={node.x - 60}
              y={56}
              width={120}
              height={48}
              rx={8}
              fill="var(--color-surface)"
              stroke="var(--color-border)"
            />
            <text
              x={node.x}
              y={85}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-muted)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-muted">
        STATIC PREVIEW — live execution coming in build phase 2
      </figcaption>
    </figure>
  );
}
