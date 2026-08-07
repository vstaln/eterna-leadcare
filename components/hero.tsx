import { ArrowRight, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import HeroDataPanel from "@/components/hero-data-panel";

export default async function Hero() {
  return (
    <section className="bg-grid scanlines relative overflow-hidden pt-20 pb-16 sm:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="mb-6 flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
              <TerminalWindow className="h-4 w-4 text-live" aria-hidden="true" />
              ET-48 // BUILD PHASE 1
            </p>
            <h1 className="max-w-3xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text">
              Eterna Ops Command Center
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted">
              A live, honest EMPWR webhook showcase: lead form to report card.
              Built in 48 hours for $0.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#pipeline"
                className="inline-flex items-center gap-2 bg-ok px-6 py-3 text-sm font-semibold text-zinc-950 transition-[filter,transform] duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live active:scale-[0.98]"
              >
                <span>See the pipeline</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <span
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-muted/60"
              >
                Hire me
                <span className="font-mono text-[0.625rem] uppercase tracking-widest">
                  soon
                </span>
              </span>
            </div>
          </div>
          <HeroDataPanel />
        </div>
      </div>
    </section>
  );
}

