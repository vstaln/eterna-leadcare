export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs tracking-widest text-muted">
          Leadcare // eterna.vstal.in
          <span className="caret" aria-hidden="true" />
        </p>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Built by Vstalin — application for Lead Automation &amp; Web
          Engineer at Eterna Indonesia.
        </p>
      </div>
    </footer>
  );
}
