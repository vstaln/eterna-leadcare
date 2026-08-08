"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Gauge, Clock, GitBranch, PaperPlaneTilt } from "@phosphor-icons/react";
import Magnet from "@/components/Magnet";
import TourTrigger from "@/components/tour";

const links = [
  { label: "Home", href: "/", live: true, icon: House, external: false },
  { label: "Live", href: "/live", live: true, icon: Clock, external: false },
  { label: "Ops", href: "/ops", live: true, icon: Gauge, external: false },
  { label: "n8n", href: "/n8n/workflow/e5336198-9ef1-46e5-8746-4681e17aba1f", live: true, icon: GitBranch, external: true },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-base/80 backdrop-blur">
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            aria-label="Leadcare — home"
            className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-muted"
          >
            <span>Leadcare</span>
          </Link>
          <ul className="flex items-center gap-2.5 sm:gap-5">
            {links.map((link) => {
              const Icon = link.icon;
              return link.live ? (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="flex items-center gap-1.5 text-sm font-medium text-text transition-colors duration-150 hover:text-muted focus-visible:outline-2 focus-visible:outline-live"
                  >
                    <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ) : (
                <li key={link.href}>
                  <span
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-1.5 text-sm text-muted/60"
                  >
                    <Icon className="h-4 w-4 text-muted/40" aria-hidden="true" />
                    <span className="hidden sm:inline">{link.label}</span>
                    <span className="sm:hidden">{link.label.split(" ")[0]}</span>
                    <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                      soon
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <TourTrigger variant="nav" />
          <Magnet className="inline-flex" padding={6} activeStrength={2}>
            <Link
              href="https://wa.me/6281585034712"
              target="_blank"
              rel="noreferrer"
              className="press hidden items-center gap-1.5 bg-ok px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live sm:inline-flex"
            >
              <PaperPlaneTilt className="h-4 w-4" aria-hidden="true" />
              <span>Contact me</span>
            </Link>
          </Magnet>
        </div>
      </nav>
    </header>
  );
}
