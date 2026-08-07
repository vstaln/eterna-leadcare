import { ArrowRight, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import HeroDataPanel from "@/components/hero-data-panel";
import TourTrigger from "@/components/tour";
import { HeroHeadline, PanelTilt } from "@/components/hero-animated";

export default async function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-24 pb-16 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="scanlines absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-live/10 blur-3xl" />
        <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-ok/10 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-text/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="mb-6 flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
              <TerminalWindow className="h-4 w-4 text-live" aria-hidden="true" />
              ETERNA LEADCARE // PRODUCT DEMO
            </p>
            <HeroHeadline />
            <p className="mt-6 measure text-balance text-base leading-relaxed text-muted">
              Eterna LeadCare is a simple add-on for any client website: block the spam, save
              who they are, log the lead — then watch every step on a live dashboard, with a
              tracking number on every lead.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 bg-ok px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live"
              >
                <span>See it happen</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <TourTrigger />
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live"
              >
                Try it
              </a>
            </div>
            <p className="mt-5 text-xs text-muted">
              Every lead arrives. Every lead is tracked. Every lead arrives with proof.
            </p>
          </div>
          <PanelTilt className="min-h-[22rem] lg:min-h-0">
            <div id="live-panel">
              <HeroDataPanel />
            </div>
          </PanelTilt>
        </div>
      </div>
    </section>
  );
}
