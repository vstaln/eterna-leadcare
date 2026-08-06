export default function Hero() {
  return (
    <section className="bg-grid scanlines relative overflow-hidden pt-36 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          ET-48 // BUILD PHASE 1
        </p>
        <h1 className="max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text">
          Eterna Ops Command Center
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          A live, honest automation showcase replicating Eterna&apos;s EMPWR
          webhook pattern — lead form to report card through N8N and Apps
          Script. Built from scratch in 48 hours on a $0 budget.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#pipeline"
            className="bg-ok text-base px-6 py-3 text-sm font-semibold transition-[filter] duration-150 hover:brightness-110"
          >
            See the pipeline
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
    </section>
  );
}
