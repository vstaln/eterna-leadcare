"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  const isV3 = pathname.startsWith("/v3");
  return (
    <footer className={`border-t border-border ${isV3 ? "v3" : ""}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          ETERNA LEADCARE // eterna.vstal.in
          <span className="caret" aria-hidden="true" />
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <nav aria-label="Version" className="flex items-center gap-2 font-mono text-xs text-muted">
            <Link
              href="/v2"
              aria-current={!isV3 ? "page" : undefined}
              className={`transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-live ${
                !isV3 ? "text-text underline decoration-ok underline-offset-4" : "hover:text-text"
              }`}
            >
              v2
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/v3"
              aria-current={isV3 ? "page" : undefined}
              className={`transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-live ${
                isV3 ? "text-text underline decoration-ok underline-offset-4" : "hover:text-text"
              }`}
            >
              v3
            </Link>
          </nav>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Built by Vstalin — every row on the ops dashboard is a
            real execution, nothing simulated.
          </p>
        </div>
      </div>
    </footer>
  );
}
