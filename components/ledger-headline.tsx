"use client";
import { useReducedMotion } from "motion/react";
import { useDialKit } from "dialkit";
import SplitText from "@/components/SplitText";

export default function LedgerHeadline() {
  const reduced = useReducedMotion();
  const dial = useDialKit("SplitText", {
    delay: [30, 0, 180],
    duration: [0.45, 0.1, 0.9],
    distance: [10, 0, 40],
  });
  const className =
    "max-w-6xl text-balance text-[clamp(3.25rem,8vw,7rem)] font-semibold leading-[0.98] tracking-tighter text-text";
  if (reduced) {
    return <h1 className={className}>Every lead, entered into the ledger.</h1>;
  }
  return (
    <SplitText
      text="Every lead, entered into the ledger."
      tag="h1"
      textAlign="left"
      className={className}
      splitType="words"
      delay={dial.delay}
      duration={dial.duration}
      from={{ opacity: 0, y: dial.distance }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.05}
    />
  );
}
