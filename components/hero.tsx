export default function Hero() {
  return (
    <section className="bg-grid scanlines relative overflow-hidden pt-28 pb-20 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 inline-flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-xs text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-muted/40" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted/40" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted/40" aria-hidden="true" />
          <span className="ml-2 hidden sm:inline">vstal@eterna:~/front-door</span>
          <span className="sm:hidden">~/front-door</span>
        </div>
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          ET-48 // BUILD PHASE 1
        </p>
        <h1 className="max-w-3xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text">
          Eterna Ops Command Center
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted">
          A live, honest automation showcase replicating Eterna&apos;s EMPWR
          webhook pattern — lead form to report card through N8N and Apps
          Script. Built from scratch in 48 hours on a $0 budget.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#pipeline"
            className="bg-ok text-base px-6 py-3 text-sm font-semibold transition-[filter,transform] duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live active:scale-[0.98]"
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
