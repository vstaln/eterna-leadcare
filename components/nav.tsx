"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveBadge from "@/components/live-badge";

const links = [
  { label: "Home", href: "/", live: true },
  { label: "Live", href: "/live", live: false },
  { label: "Ops", href: "/ops", live: true },
  { label: "Behind the Scenes", href: "/behind-the-scenes", live: false },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-base/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <ul className="flex items-center gap-2.5 sm:gap-6">
          {links.map((link) =>
            link.live ? (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="text-sm font-medium text-text transition-colors duration-150 hover:text-muted focus-visible:outline-2 focus-visible:outline-live"
                >
                  {link.label}
                </Link>
              </li>
            ) : (
              <li key={link.href}>
                <span
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-2 text-sm text-muted/60"
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">
                    {link.label.split(" ")[0]}
                  </span>
                  <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                    soon
                  </span>
                </span>
              </li>
            )
          )}
        </ul>
        <LiveBadge />
      </nav>
    </header>
  );
}
