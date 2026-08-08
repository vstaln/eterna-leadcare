"use client";
import { useEffect, useState } from "react";

const DEFAULT_LINES = [
  "eterna@desk:~$ node intake.js --live",
  "spam-shield: honeypot armed",
  "spam-shield: watching...",
  "intake: awaiting POST /api/lead",
  "intake: origin check ok",
  "dispatch: signing payload",
  "dispatch: queueing to n8n",
  "log: execution.store += 1",
  "ledger: row stamped, tracking issued",
];

interface FaultyTerminalProps {
  lines?: string[];
  typeSpeed?: number;
  className?: string;
}

export default function FaultyTerminal({
  lines = DEFAULT_LINES,
  typeSpeed = 550,
  className = "",
}: FaultyTerminalProps) {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => {
        if (v >= lines.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, typeSpeed);
    return () => clearInterval(interval);
  }, [lines.length, typeSpeed]);

  return (
    <pre
      aria-hidden="true"
      className={`pointer-events-none select-none font-mono text-xs leading-6 ${className}`}
    >
      {lines.slice(0, visible).map((line, i) => (
        <span
          key={line}
          className="glitch-line block"
          style={{ ["--glitch-delay" as string]: (i * 0.7) % 5 }}
        >
          <span className={i % 2 ? "opacity-60" : undefined}>{line}</span>
        </span>
      ))}
      <span className="caret" aria-hidden="true" />
    </pre>
  );
}
