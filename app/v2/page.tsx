import Hero from "@/components/hero";
import LiveTicker from "@/components/live-ticker";
import PipelineDiagram from "@/components/pipeline-diagram";
import ApplicationForm from "@/components/application-form";
import SectionHeading from "@/components/section-heading";
import SpotlightCard from "@/components/SpotlightCard";
import AnimatedContent from "@/components/AnimatedContent";

export const dynamic = "force-dynamic";

const aboutCards: [string, string, string][] = [
  [
    "01 // CAPTURE",
    "Lead capture",
    "A typed intake API on this site. Every submission is checked by a honeypot shield that catches bots and records each blocked attempt — nothing silent, nothing hidden.",
  ],
  [
    "02 // DISPATCH",
    "Automation",
    "Accepted leads are dispatched onward through a signed workflow — exactly the N8N-style orchestration Eterna runs for clients — with every state recorded.",
  ],
  [
    "03 // REPORT",
    "Live reporting",
    "The ops dashboard renders the real execution store: per-day chart, named stages, and a tracking number on every lead. No simulated lights.",
  ],
];

const aboutAccent = ["border-t-ok", "border-t-live", "border-t-warn"];

const trustItems = [
  ["Real store, not a mockup", "Every row you see on the dashboard is a real submission that went through this pipeline. The store file is right here in the repo."],
  ["Failures are named, not hidden", "If a step can't report, it says N/R — never a green light. If a piece is pending, the page says PENDING. Degraded states render DEGRADED."],
  ["Open build", "The whole pipeline, the workflow definition, and the build log are documented behind the scenes — including what is still waiting on you."],
];

const cornerPositions = [
  "top-0 left-0",
  "top-0 right-0",
  "bottom-0 left-0",
  "bottom-0 right-0",
];

export default function V2Page() {
  return (
    <div>
      <Hero />
      <LiveTicker />
      <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHAT LEADCARE DOES" title="What LeadCare does" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aboutCards.map(([module, title, text], i) => (
            <AnimatedContent key={title} distance={10} duration={0.45} className="h-full">
              <article className={`h-full border border-border border-t-2 bg-surface p-6 ${aboutAccent[i]}`}>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">{module}</p>
                <h3 className="mt-2 font-semibold text-text">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
              </article>
            </AnimatedContent>
          ))}
        </div>
      </section>
      <section id="role" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHY YOU CAN TRUST IT" title="Why you can trust it" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {trustItems.map(([title, text]) => (
            <SpotlightCard
              key={title}
              spotlightColor="rgba(52, 211, 153, 0.09)"
              className="h-full transition-colors hover:border-live"
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
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>
      <section id="demo" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading title="The pipeline, live" />
        <p className="measure mb-8 text-sm leading-relaxed text-muted">This is the LeadCare pipeline, running on this page right now. Every recorded lead follows a visible path with named stages.</p>
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-live" aria-hidden="true" />
            <span>$ ./pipeline --live</span>
            <span className="caret" aria-hidden="true" />
          </div>
          <div className="p-4">
            <PipelineDiagram />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <a id="ops-link" href="/ops" className="press inline-flex items-center gap-2 bg-ok px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live">View the ops dashboard</a>
          <a href="/behind-the-scenes" className="press inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">Behind the scenes</a>
        </div>
      </section>
      <section id="contact" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="TRY IT" title="Try it" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="measure text-sm leading-relaxed text-muted">Send a test lead — it travels the same path a real one would: checked, logged, and tracked live on the ops dashboard. This form is a live demo, not Eterna&apos;s official application.</p>
          </div>
          <div>
            <ApplicationForm />
            <p className="mt-3 font-mono text-xs text-muted">
              {"// submits via POST /api/lead — honeypot-gated, tracked live on /ops"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
