export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          ETERNA LEADCARE // eterna.vstal.in
        </p>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Built by Vstalin — every row on the ops dashboard is a
          real execution, nothing simulated.
        </p>
      </div>
    </footer>
  );
}
