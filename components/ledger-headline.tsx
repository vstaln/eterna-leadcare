// ledger-headline.tsx — the hero H1: "Every lead, checked, logged, shown live."
//
// Renders the DecryptedText scramble when motion is allowed; a static H1
// under prefers-reduced-motion (the real string either way — no SEO or
// a11y cost, since DecryptedText keeps the full text as its aria-label).
"use client";
import { useReducedMotion } from "motion/react";
import DecryptedText from "@/components/DecryptedText";

export default function LedgerHeadline() {
  const reduced = useReducedMotion();
  const className =
    "max-w-6xl text-balance text-[clamp(3.25rem,8vw,7rem)] font-semibold leading-[0.98] tracking-tighter text-text";
  if (reduced) {
    return <h1 className={className}>Every lead, checked, logged, shown live.</h1>;
  }
  return (
    <h1 className={className}>
      <DecryptedText text="Every lead, checked, logged, shown live." encryptedClassName="text-muted/50" />
    </h1>
  );
}
