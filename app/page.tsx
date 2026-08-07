import Hero from "@/components/hero";
import PipelineDiagram from "@/components/pipeline-diagram";
import ApplicationForm from "@/components/application-form";
import SectionHeading from "@/components/section-heading";
import SpotlightCard from "@/components/SpotlightCard";
import AnimatedContent from "@/components/AnimatedContent";
export const dynamic = "force-dynamic";
const aboutCards = [
  ["Lead capture", "A typed intake API on this site. Every submission is checked by a honeypot shield that catches bots and records each blocked attempt — nothing silent, nothing hidden."],
  ["Automation", "Accepted leads are dispatched onward through a signed workflow — exactly the N8N-style orchestration Eterna runs for clients — with every state recorded."],
  ["Live reporting", "The ops dashboard renders the real execution store: per-day chart, named stages, and a tracking number on every lead. No simulated lights."],
];
const trustItems = [
  ["Real store, not a mockup", "Every row you see on the dashboard is a real submission that went through this pipeline. The store file is right here in the repo."],
  ["Failures are named, not hidden", "If a step can't report, it says N/R — never a green light. If a piece is pending, the page says PENDING. Degraded states render DEGRADED."],
  ["Open build", "The whole pipeline, the workflow definition, and the build log are documented behind the scenes — including what is still waiting on you."],
];
export default function Home() {
  return (
    <div>
      <Hero />
      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="WHAT LEADCARE DOES" title="What LeadCare does" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aboutCards.map(([title, text]) => (
            <AnimatedContent key={title} distance={12} duration={0.5} className="h-full">
              <article className="h-full border border-border bg-surface p-6">
                <h3 className="font-semibold text-text">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
              </article>
            </AnimatedContent>
          ))}
        </div>
      </section>
      <section id="role" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="WHY YOU CAN TRUST IT" title="Why you can trust it" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {trustItems.map(([title, text]) => (
            <SpotlightCard key={title} spotlightColor="rgba(52, 211, 153, 0.09)" className="h-full">
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>
      <section id="demo" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading title="The pipeline, live" />
        <p className="measure mb-8 text-sm leading-relaxed text-muted">This is the LeadCare pipeline, running on this page right now. Every recorded lead follows a visible path with named stages.</p>
        <PipelineDiagram />
        <div className="mt-8 flex flex-wrap gap-4">
          <a id="ops-link" href="/ops" className="inline-flex items-center gap-2 bg-ok px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live">View the ops dashboard</a>
          <a href="/behind-the-scenes" className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">Behind the scenes</a>
        </div>
      </section>
      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="TRY IT" title="Try it" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="measure text-sm leading-relaxed text-muted">Send a test lead — it travels the same path a real one would: checked, logged, and tracked live on the ops dashboard. This form is a live demo, not Eterna&apos;s official application.</p>
          </div>
          <ApplicationForm />
        </div>
      </section>
    </div>
  );
}
