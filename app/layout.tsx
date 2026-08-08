// layout.tsx — root layout: fonts, nav, footer, dial-panel.
//
// Both font families are self-hosted at build time via next/font/google
// (no external <link>, no invisible-text flash; `display: swap`). They are
// exposed as CSS variables (--font-sans / --font-mono) that globals.css
// maps to the Tailwind `font-sans` / `font-mono` utilities.
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Nav from "@/components/nav";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://eterna.vstal.in"),
  title: "Leadcare — every lead, checked, logged, shown live",
  description: "Leadcare: a live lead-handling demo — honeypot shield, signed dispatch, execution store, and an honest dashboard. Every lead gets a tracking number.",
  openGraph: { title: "Leadcare — every lead, checked, logged, shown live", description: "Leadcare: a live lead-handling demo — honeypot shield, signed dispatch, execution store, and an honest dashboard. Every lead gets a tracking number.", url: "https://eterna.vstal.in", siteName: "Leadcare", locale: "en_US", type: "website" },
};

// DialPanel is a dev-only tweak UI (dialkit). It's dynamically imported and
// rendered only when NODE_ENV !== "production" — zero impact on the live
// site, but available during local development.
const DialPanel = process.env.NODE_ENV !== "production" ? (await import("@/components/dial-panel")).default : null;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col`}><a href="#main" className="skip-link">Skip to content</a><Nav /><main id="main" className="flex-1">{children}</main><SiteFooter />{DialPanel && <DialPanel />}</body></html>;
}
