"use client";

// components/pipeline-demo.tsx
//
// The animated LeadCare pipeline: a real lead (carrying its real tracking
// number) travels the five lockstep stages on screen. Honest by construction —
// the stage states come from the server's live probes (lib/stages.ts), so a
// PENDING / N/R / DEGRADED leg is shown as-is, never a fake green light.
//
// The server page passes serializable props only (stage states + real data);
// this component is a pure client island. No new dependencies — motion is
// already in use, and the supporting CSS lives in app/globals.css under the
// "pipeline-demo" block.

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowClockwise, Play } from "@phosphor-icons/react";
import { useInView, useReducedMotion } from "motion/react";

export type PipelineStageProp = {
  num: string;
  name: string;
  state: string;
  led: string;
  source: string;
  note: string;
};

export type PipelineDemoProps = {
  stages: PipelineStageProp[];
  tracking: string | null;
  shieldBlocked: number;
  lastLeadText: string | null;
};

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

// One beat per stage: how long we hold at a stage, then how long the lead
// takes to hop to the next one.
const HOLD_MS = 700;
const HOP_MS = 950;

// Plain-English "what actually happens here" per stage — the jargon→value map
// from docs/leadcare-hr-script.md, keyed by the lockstep stage name.
const STAGE_COPY: Record<string, { what: string; internals: string }> = {
  CAPTURED: {
    what: "A lead arrives — the form posts to a typed intake API, timestamped the instant it lands.",
    internals: "POST /api/lead → data/executions.json",
  },
  "SPAM SHIELD": {
    what: "Bots get blocked and counted. A hidden honeypot traps them before they become leads; the dispatch is signed so only we can send.",
    internals: "honeypot + HMAC verify · blocked, counted",
  },
  RESEARCHED: {
    what: "We look up who's writing. n8n verifies the signature, then looks up the email domain — real company, real domain.",
    internals: "n8n → RDAP domain lookup",
  },
  LOGGED: {
    what: "Written down with a tracking number. The enriched lead is mapped and written to the permanent receipt.",
    internals: "Apps Script → Google Sheets · ELC-2026-XXXXX",
  },
  LIVE: {
    what: "You watch it live. The ops dashboard renders every row and every state honestly — nothing simulated.",
    internals: "/ops dashboard",
  },
};

// The narrator line shown under the track as the lead hops.
const CAPTIONS: string[] = [
  "A lead arrives — every submission is timestamped the moment it lands.",
  "Bots get blocked and counted; the signed dispatch is verified.",
  "n8n looks up who's writing — the email domain, via RDAP.",
  "The lead is written down with its tracking number.",
  "Live on the ops dashboard — every row real, nothing simulated.",
];

const cornerPositions = [
  "top-0 left-0",
  "top-0 right-0",
  "bottom-0 left-0",
  "bottom-0 right-0",
];

// Center of stage i in a row of n stages, in percent of track width.
const center = (i: number, n: number) => ((i + 0.5) / n) * 100;

export default function PipelineDemo({
  stages,
  tracking,
  shieldBlocked,
  lastLeadText,
}: PipelineDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState(-1);
  const [runId, setRunId] = useState(0);
  const timers = useRef<number[]>([]);
  const tokenRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const stopRun = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const startRun = useCallback(() => {
    stopRun();
    // Hard-reset (no transition) so a replay snaps back instead of sliding.
    if (tokenRef.current) tokenRef.current.style.transition = "none";
    if (progressRef.current) progressRef.current.style.transition = "none";
    setPhase(-1);
    setRunId((n) => n + 1);
    requestAnimationFrame(() => {
      if (tokenRef.current) tokenRef.current.style.transition = "";
      if (progressRef.current) progressRef.current.style.transition = "";
      for (let i = 0; i < stages.length; i++) {
        timers.current.push(
          window.setTimeout(() => setPhase(i), HOLD_MS + i * HOP_MS)
        );
      }
    });
  }, [stages.length, stopRun]);

  useEffect(() => {
    if (!inView || reduced) return;
    // Defer so setState never happens synchronously in the effect body
    // (react-hooks/set-state-in-effect); the run is driven by its own timers.
    const id = window.setTimeout(startRun, 100);
    return () => window.clearTimeout(id);
  }, [inView, reduced, startRun]);

  useEffect(() => stopRun, [stopRun]);

  const running = phase >= 0;
  const progress = running ? ((phase + 1) / stages.length) * 100 : 0;
  const caption = running
    ? CAPTIONS[Math.max(0, phase)]
    : "Pipeline idle — press run.";
  const note = running
    ? stages[Math.max(0, phase)].note
    : "Five lockstep stages — same vocabulary as the ops dashboard.";

  const nodes = (
    <div className="relative grid grid-cols-1 gap-px bg-border md:grid-cols-5">
      {stages.map((stage, i) => {
        const lit = running && phase >= i;
        const here = running && phase === i;
        const copy = STAGE_COPY[stage.name] ?? {
          what: stage.note,
          internals: stage.source,
        };
        return (
          <article
            key={stage.num}
            className="relative flex min-h-[16rem] flex-col bg-surface p-6 transition-colors duration-500 md:min-h-[18rem]"
            style={{
              backgroundColor: lit
                ? "color-mix(in srgb, var(--color-live) 6%, transparent)"
                : "",
            }}
          >
            {cornerPositions.map((pos) => (
              <span
                key={pos}
                aria-hidden="true"
                className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}
              >
                +
              </span>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`led-${stage.led}`} aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                STAGE {stage.num}
              </span>
              <span className={`font-mono text-xs ${stateColor[stage.state]}`}>
                {stage.state}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-text">
              {stage.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {copy.what}
            </p>
            <p className="mt-auto pt-5 font-mono text-xs text-muted">
              {copy.internals}
            </p>
            {here && <span className="pipeline-here" aria-hidden="true" />}
          </article>
        );
      })}
    </div>
  );



  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
      <span className="flex items-center gap-2">
        <span className="led-live" aria-hidden="true" />
        <span>PIPELINE // one real lead</span>
        <span className="caret" aria-hidden="true" />
      </span>
      <span className="tabular-nums">TRACKING {tracking ?? "—"}</span>
    </div>
  );

  const footer = (
    <div className="border-t border-border">
      <div key={runId} className="px-4 py-4">
        <p role="status" className="pipeline-caption font-mono text-sm text-text">
          {`> ${caption}`}
        </p>
        <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
          {note}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <span className="font-mono text-xs text-muted">
          {`SHIELD ${shieldBlocked} BLOCKED`}
          {lastLeadText
            ? ` · LAST ${lastLeadText}`
            : " · NO LEADS YET — submit a test lead below"}
        </span>
        <button
          type="button"
          onClick={startRun}
          className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live"
        >
          {running ? (
            <ArrowClockwise size={14} weight="bold" aria-hidden="true" />
          ) : (
            <Play size={14} weight="bold" aria-hidden="true" />
          )}
          {running ? "RUN AGAIN" : "RUN PIPELINE"}
        </button>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <div ref={ref} className="relative overflow-hidden border border-border bg-surface">
        {header}
        {nodes}
        <div className="border-t border-border px-4 py-4">
          <p className="font-mono text-sm text-text">
            The five stages — rendered statically under reduced motion.
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
            Five lockstep stages — same vocabulary as the ops dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span className="font-mono text-xs text-muted">
            {`SHIELD ${shieldBlocked} BLOCKED`}
            {lastLeadText
              ? ` · LAST ${lastLeadText}`
              : " · NO LEADS YET — submit a test lead below"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border border-border bg-surface"
    >
      {header}
      {/* the track — a real lead flows left → right */}
      <div className="relative h-12">
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
          aria-hidden="true"
        />
        <div
          ref={progressRef}
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-live"
          style={{
            width: `${progress}%`,
            opacity: running ? 1 : 0,
            transition: "width 900ms var(--ease-smooth-out)",
          }}
          aria-hidden="true"
        />
        <div
          ref={tokenRef}
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${running ? center(Math.max(0, phase), stages.length) : 0}%`,
            opacity: running ? 1 : 0,
            transition: "left 900ms var(--ease-smooth-out)",
          }}
          aria-hidden="true"
        >
          <span className="pipeline-token" />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 border-b border-border"
          aria-hidden="true"
        />
      </div>
      {nodes}
      {footer}
    </div>
  );
}
