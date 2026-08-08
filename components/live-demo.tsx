// live-demo.tsx — the "view only" n8n workflow embed (revived from 843a32c).
//
// Shows the REAL workflow editor (the same instance the pipeline runs on) in
// an iframe, with the editor chrome hidden via same-origin CSS injection so
// visitors see just the node canvas: pan + zoom free, edits locked. A viewer
// session comes from /api/demo-session (n8n owner creds exchanged for a
// cookie); if that's not configured, the section shows an honest fallback.
"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/section-heading";

const WORKFLOW_URL = "/n8n/workflow/e5336198-9ef1-46e5-8746-4681e17aba1f";

// One plain-English line per node in the workflow, in flow order — the
// legend under the embed. Keep it jargon-light; the embed itself is the
// source of truth.
const NODES = [
  {
    name: "Lead",
    desc: "The front door. The site's /api/lead POSTs every accepted submission here — first stop for a real lead.",
  },
  {
    name: "Verify HMAC",
    desc: "Re-derives the signature from executionId + nonce + timestamp using the shared secret, checks the timestamp is under 5 minutes old, and compares in constant time. Pure-JS on purpose: n8n's sandbox blocks require('crypto').",
  },
  {
    name: "Signature OK?",
    desc: "The gate. Wrong signature or stale timestamp → Respond 401, which the site records as a shield event (n8n_rejected) — an honest rejection, not a network error.",
  },
  {
    name: "RDAP Enrich",
    desc: "Looks up the email's domain on rdap.org: who registered it, when it was created/updated, its status and nameservers. If RDAP can't find the domain, the run continues anyway — a lead never dies because enrichment failed.",
  },
  {
    name: "Map Log Params",
    desc: "Shapes the enriched data into the log row (executionId, name, email, company, domain, registrar, created, updated, status, nameservers) for the next node.",
  },
  {
    name: "Apps Script Log",
    desc: "Token-gated GET to the Google Apps Script web app, which appends the row to a Google Sheet — the permanent, client-visible receipt.",
  },
  {
    name: "Respond 200",
    desc: "All good: answers the webhook with ok:true. The site marks the lead dispatched and prints the tracking number.",
  },
  {
    name: "Respond Degraded",
    desc: "The Sheets leg failed (e.g. APPS_SCRIPT_URL empty), but the workflow still answers 200 with ok:false — honest degraded, never a silent hang.",
  },
  {
    name: "Respond 401",
    desc: "The rejection path: bad signature or stale timestamp. The site records it as n8n_rejected in the shield log.",
  },
];

// Chrome hiding for the n8n editor iframe (same-origin, so the parent page can
// inject CSS into the iframe). Selectors were discovered on the live editor
// page (n8n 1.123) with headless Chrome:
//   - #app-grid is a named-areas grid: "banners banners" / "sidebar header" /
//     "sidebar content". #header holds the breadcrumb ("Personal / …"), the
//     0/2 zoom readout and the Active/Share/Saved actions plus the
//     Editor|Executions|Evaluations tab row. #sidebar is the left rail (and
//     the collapsed bottom-left node palette menu lives inside it).
//   - #banners is the promo strip slot, #content > :last-child is the bottom
//     status/logs bar ("Logs"), #canvas ~ div are the canvas siblings (the
//     "Execute workflow" button and the vertical undo/redo buttons), and the
//     vue-flow zoom controls + minimap are canvas overlays.
// Only structural ids and vue-flow classes are used — no hashed module names.
const HIDE_CHROME_CSS = `
#header, #sidebar, #banners, #app-modals { display: none !important; }
#app-grid { grid-template-areas: "content" !important; grid-template-columns: minmax(0, 1fr) !important; grid-template-rows: minmax(0, 1fr) !important; }
#content { grid-area: content !important; height: 100% !important; overflow: hidden !important; }
#content > div:first-child, #content > div:first-child > div, #content > div:first-child > div > div { height: 100% !important; }
#canvas { height: 100% !important; }
#content > div:last-child { display: none !important; }
#canvas ~ div { display: none !important; }
.vue-flow__controls, .vue-flow__minimap { display: none !important; }
`;

// n8n restores the workflow's saved viewport on load, which can leave nodes
// clipped once the editor chrome is hidden. Fit the node bounding box into
// the visible canvas (idempotent; vue-flow only re-applies its own transform
// on pan/zoom events, which the parent page blocks).
function fitFlowToCanvas(doc: Document) {
  const pane = doc.querySelector<HTMLElement>(".vue-flow__transformationpane");
  const flow = doc.querySelector<HTMLElement>(".vue-flow");
  if (!pane || !flow) return;
  const m = (pane.style.transform || "").match(
    /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)\s*scale\((-?[\d.]+)\)/,
  );
  if (!m) return;
  const tx = parseFloat(m[1]);
  const ty = parseFloat(m[2]);
  const scale = parseFloat(m[3]);
  const nodes = Array.from(doc.querySelectorAll(".vue-flow__node"));
  if (nodes.length < 2) return;
  const r = flow.getBoundingClientRect();
  if (r.width < 100 || r.height < 100) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const b = n.getBoundingClientRect();
    const x = (b.left - tx) / scale;
    const y = (b.top - ty) / scale;
    const x2 = (b.right - tx) / scale;
    const y2 = (b.bottom - ty) / scale;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  }
  const bw = maxX - minX;
  const bh = maxY - minY;
  if (!(bw > 0) || !(bh > 0)) return;
  const pad = 80;
  const ns = Math.min((r.width - pad) / bw, (r.height - pad) / bh);
  if (ns <= 0) return false;
  const ntx = (r.width - bw * ns) / 2 - minX * ns;
  const nty = (r.height - bh * ns) / 2 - minY * ns;
  pane.style.transform = `translate(${ntx.toFixed(2)}px, ${nty.toFixed(2)}px) scale(${ns.toFixed(4)})`;
  return true;
}

function stripEditorChrome(doc: Document): boolean {
  if (!doc.head) return false;
  let style = doc.getElementById("eterna-chrome-hider") as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = "eterna-chrome-hider";
    doc.head.appendChild(style);
  }
  style.textContent = HIDE_CHROME_CSS;
  try {
    // once the whole flow fits, stop re-fitting so the visitor can pan/zoom
    return fitFlowToCanvas(doc) === true;
  } catch {
    // the editor mounts async — the interval below re-applies until it settles
    return false;
  }
}

export default function LiveDemo() {
  const [session, setSession] = useState<"loading" | "ok" | "failed">("loading");

  useEffect(() => {
    fetch("/api/demo-session", { cache: "no-store" })
      .then((r) => setSession(r.ok ? "ok" : "failed"))
      .catch(() => setSession("failed"));
  }, []);

  useEffect(() => {
    if (session !== "ok") return;
    let ticks = 0;
    const timer = setInterval(() => {
      const iframe = document.getElementById(
        "eterna-workflow-iframe",
      ) as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      if (doc && doc.getElementById("n8n-app")) {
        const settled = stripEditorChrome(doc);
        if (settled || ++ticks > 40) clearInterval(timer);
      } else if (++ticks > 80) {
        clearInterval(timer);
      }
    }, 700);
    return () => clearInterval(timer);
  }, [session]);

  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 pb-24 pt-4 md:pb-32">
      <SectionHeading eyebrow="THE WORKFLOW" title="The n8n flow chart, view only" />
      <div className="mt-8 border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="led-live" aria-hidden="true" />
          <span>N8N — WORKFLOW: Leadcare pipeline</span>
          <span
            className="stamp stamp-red ml-auto !px-2 !py-0.5 !text-[0.625rem]"
            aria-hidden="true"
          >
            VIEW ONLY
          </span>
        </div>
        <div className="relative">
          {session === "loading" ? (
            <div className="flex h-[400px] items-center justify-center sm:h-[480px]">
              <p className="font-mono text-xs text-muted">opening the live session…</p>
            </div>
          ) : (
            <iframe
              key={session}
              id="eterna-workflow-iframe"
              src={WORKFLOW_URL}
              title="Leadcare pipeline in n8n — view only"
              className="h-[400px] w-full border-0 sm:h-[480px]"
              onLoad={(e) => {
                const doc = e.currentTarget.contentDocument;
                if (doc) stripEditorChrome(doc);
              }}
            />
          )}
          {session === "failed" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/85 p-6 text-center">
              <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
                The live view could not open a session right now.
                <br />
                <a
                  href="/n8n"
                  className="underline decoration-ok underline-offset-4 hover:text-text"
                >
                  Open n8n directly
                </a>
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Real instance — the same one the pipeline runs on. Viewer session: pan and zoom the flow freely, edits stay locked.</span>
          <a href={WORKFLOW_URL} className="underline decoration-ok underline-offset-4 hover:text-text">
            Open in a new tab ↗
          </a>
        </div>
      </div>

      <div className="mt-8 border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="led-live" aria-hidden="true" />
          <span>NODES</span>
        </div>
        <ol className="divide-y divide-border">
          {NODES.map((node, i) => (
            <li
              key={node.name}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-text sm:w-44">
                {String(i + 1).padStart(2, "0")} {node.name}
              </span>
              <span className="font-mono text-xs leading-relaxed text-muted">{node.desc}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
