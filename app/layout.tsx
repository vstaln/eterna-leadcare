import type { Metadata } from "next";
import Nav from "@/components/nav";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eterna.vstal.in"),
  title: "Eterna Ops Command Center",
  description:
    "A live automation showcase: EMPWR-pattern webhook pipeline from lead form to report card, built honestly and open.",
  openGraph: {
    title: "Eterna Ops Command Center",
    description:
      "A live automation showcase: EMPWR-pattern webhook pipeline from lead form to report card, built honestly and open.",
    url: "https://eterna.vstal.in",
    siteName: "Eterna Ops Command Center",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Eterna Ops Command Center",
    description:
      "A live automation showcase: EMPWR-pattern webhook pipeline from lead form to report card, built honestly and open.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
