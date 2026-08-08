"use client";
import { useReducedMotion } from "motion/react";
import DecryptedText from "@/components/DecryptedText";

export default function LedgerHeadline() {
  const reduced = useReducedMotion();
  const className =
    "max-w-6xl text-balance text-[clamp(3.25rem,8vw,7rem)] font-semibold leading-[0.98] tracking-tighter text-text";
  if (reduced) {
    return <h1 className={className}>Every lead, entered into the ledger.</h1>;
  }
  return (
    <h1 className={className}>
      <DecryptedText text="Every lead, entered into the ledger." encryptedClassName="text-muted/50" />
    </h1>
  );
}
