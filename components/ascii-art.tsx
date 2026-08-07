// ascii-art.tsx — decorative ASCII pipeline diagram + wordmark.
//
// The LeadCare site's identity is a terminal/console aesthetic, so the
// pipeline is drawn as pure ASCII art (like a diagram you'd print in a
// terminal). Stage names MUST stay in lockstep with the ops dashboard
// and the Webflow one-pager: Captured → Spam Shield → Researched →
// Logged → Live (one vocabulary everywhere).

export type AsciiArtVariant = "pipeline" | "wordmark";

const NAME_COLORS: Record<string, string> = {
  CAPTURED: "text-warn",
  SHIELD: "text-ok",
  RESEARCH: "text-ok",
  RECORD: "text-warn",
  LIVE: "text-ok",
};

const PIPELINE: Array<{ line: string; kind: "frame" | "names" | "subs" }> = [
  {
    line: "+----------+ --> +--------+ --> +-------+ --> +--------+ --> +--------+",
    kind: "frame",
  },
  {
    line: "|@CAPTURED@ | --> |@SHIELD@ | --> |@RESEARCH@| --> |@RECORD@ | --> | @LIVE@  |",
    kind: "names",
  },
  {
    line: "|  form    | --> |honeypot| --> |n8n·rdap | --> |  store  | --> |dashboard|",
    kind: "subs",
  },
  {
    line: "+----------+ --> +--------+ --> +-------+ --> +--------+ --> +--------+",
    kind: "frame",
  },
];

const WORDMARK = [
  "####  ####         ##    ## ",
  "#      #          # #   #  #",
  "###    #    ####  ####   ## ",
  "#      #            #   #  #",
  "####   #            #    ## ",
];

function renderLine(line: string, kind: "frame" | "names" | "subs") {
  if (kind !== "names") {
    return <span className="text-muted">{line}</span>;
  }
  return line.split(/(@[A-Z0-9]+@)/g).map((part, i) => {
    const match = part.match(/^@([A-Z0-9]+)@$/);
    return match ? (
      <span key={i} className={NAME_COLORS[match[1]]}>
        {match[1]}
      </span>
    ) : (
      <span key={i} className="text-muted">
        {part}
      </span>
    );
  });
}

export default function AsciiArt({
  variant,
  className,
}: {
  variant: AsciiArtVariant;
  className?: string;
}) {
  const decorative = variant === "wordmark";
  return (
    <div
      className={className ? `overflow-x-auto ${className}` : "overflow-x-auto"}
      aria-hidden={decorative || undefined}
    >
      <pre
        className="w-max select-text font-mono text-xs leading-snug tabular-nums"
        role={decorative ? undefined : "img"}
        aria-label={
          decorative
            ? undefined
            : "Lead pipeline: captured, spam shield, researched, logged, live"
        }
      >
        {variant === "pipeline"
          ? PIPELINE.map(({ line, kind }, i) => (
              <span key={i}>
                {renderLine(line, kind)}
                {i < PIPELINE.length - 1 ? "\n" : null}
              </span>
            ))
          : WORDMARK.map((line, i) => (
              <span key={i}>
                <span className="text-muted">{line}</span>
                {i < WORDMARK.length - 1 ? "\n" : null}
              </span>
            ))}
      </pre>
    </div>
  );
}
