import type { Metadata } from "next";
import Nav from "@/components/nav";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eterna Ops Command Center",
  description:
    "A live automation showcase — EMPWR-pattern webhook pipeline from lead form to report card, built honestly and open.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
