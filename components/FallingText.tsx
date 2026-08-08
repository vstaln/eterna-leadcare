// FallingText.tsx — letters fall in/out one by one (motion/react).
//
// Used on the 404 page ("command not found"). Each glyph animates down
// (or up) with a stagger; `continuous` repeats as a loop, otherwise it
// plays once on trigger (view / hover / always). Honors
// prefers-reduced-motion by rendering plain text, and always renders an
// sr-only copy of the full string for assistive tech.
"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

interface FallingTextProps {
  text: string;
  className?: string;
  speed?: number;
  stagger?: number;
  fade?: boolean;
  direction?: "down" | "up";
  continuous?: boolean;
  trigger?: "view" | "hover" | "always";
}

export default function FallingText({
  text,
  className = "",
  speed = 0.6,
  stagger = 0.05,
  fade = true,
  direction = "down",
  continuous = false,
  trigger = "view",
}: FallingTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [hovered, setHovered] = useState(false);

  const active =
    trigger === "always" || (trigger === "view" && inView) || (trigger === "hover" && hovered);

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  const travel = direction === "down" ? "110%" : "-110%";

  return (
    <span
      ref={ref}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span aria-hidden="true">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            initial={false}
            animate={
              active
                ? { y: travel, opacity: fade ? 0 : 1 }
                : { y: "0%", opacity: 1 }
            }
            transition={{
              duration: speed,
              delay: active ? i * stagger : 0,
              ease: [0.55, 0, 0.85, 0.36],
              repeat: active ? (continuous ? Infinity : 1) : 0,
              repeatType: "mirror",
              repeatDelay: continuous ? 0.8 : 0.5,
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
