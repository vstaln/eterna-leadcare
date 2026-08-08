import type { Metadata } from "next";
import { JetBrains_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import Nav from "@/components/nav";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });
const sourceSerif = Source_Serif_4({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://eterna.vstal.in"),
  title: "Leadcare — every lead, checked, logged, shown live",
  description: "Leadcare: a live lead-handling demo — honeypot shield, signed dispatch, execution store, and an honest ops dashboard. Every lead gets a tracking number.",
  openGraph: { title: "Leadcare — every lead, checked, logged, shown live", description: "Leadcare: a live lead-handling demo — honeypot shield, signed dispatch, execution store, and an honest ops dashboard. Every lead gets a tracking number.", url: "https://eterna.vstal.in", siteName: "Leadcare", locale: "en_US", type: "website" },
};

const DialPanel = process.env.NODE_ENV !== "production" ? (await import("@/components/dial-panel")).default : null;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} flex min-h-screen flex-col`}><a href="#main" className="skip-link">Skip to content</a><Nav /><main id="main" className="flex-1">{children}</main><SiteFooter />{DialPanel && <DialPanel />}</body></html>;
}
