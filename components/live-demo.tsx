"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/section-heading";

const WORKFLOW_URL = "/n8n/workflow/e5336198-9ef1-46e5-8746-4681e17aba1f";

export default function LiveDemo() {
  const [session, setSession] = useState<"loading" | "ok" | "failed">("loading");

  useEffect(() => {
    fetch("/api/demo-session", { cache: "no-store" })
      .then((r) => setSession(r.ok ? "ok" : "failed"))
      .catch(() => setSession("failed"));
  }, []);

  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 pb-4 pt-4 sm:pb-8">
      <SectionHeading eyebrow="THE DEMO" title="n8n, running right now" />
      <div className="mt-8 border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="led-live" aria-hidden="true" />
          <span>N8N — WORKFLOW: ETERNA LEADCARE PIPELINE</span>
          <span className="stamp stamp-red ml-auto !px-2 !py-0.5 !text-[0.625rem]" aria-hidden="true">
            VIEW ONLY
          </span>
          <span className="caret" aria-hidden="true" />
        </div>
        <div className="relative">
          {session === "loading" ? (
            <div className="flex h-[440px] items-center justify-center sm:h-[520px]">
              <p className="font-mono text-xs text-muted">opening the live session…</p>
            </div>
          ) : (
            <iframe
              key={session}
              src={WORKFLOW_URL}
              title="Eterna LeadCare pipeline in n8n — view only"
              className="h-[440px] w-full border-0 sm:h-[520px]"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 z-10" aria-hidden="true" />
          {session === "failed" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/85 p-6 text-center">
              <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
                The live view could not open a session right now.
                <br />
                <a href="/n8n" className="underline decoration-ok underline-offset-4 hover:text-text">
                  Open n8n directly
                </a>
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Real instance — the same one the pipeline runs on. Read-only, nothing clickable.</span>
          <a href={WORKFLOW_URL} className="underline decoration-ok underline-offset-4 hover:text-text">
            Open in a new tab ↗
          </a>
        </div>
      </div>
    </section>
  );
}
