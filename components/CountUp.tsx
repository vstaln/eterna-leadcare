"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  separator?: string;
  startWhen?: boolean;
  className?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 1.6,
  separator = "",
  startWhen = true,
  className = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(String(from));

  useEffect(() => {
    if (!inView || !startWhen) return;
    onStart?.();
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) =>
        setDisplay(separator ? value.toLocaleString("en-US") : String(Math.round(value))),
      onComplete: () => onEnd?.(),
    });
    return () => controls.stop();
  }, [inView, startWhen, from, to, duration, delay, separator, onStart, onEnd]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
