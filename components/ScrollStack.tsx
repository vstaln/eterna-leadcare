"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { MotionValue } from "motion/react";

interface ScrollStackProps {
  items: React.ReactNode[];
  gap?: number;
  className?: string;
}

export default function ScrollStack({ items, gap = 0.75, className = "" }: ScrollStackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  if (reduced) {
    return (
      <div className={className}>
        {items.map((item, i) => (
          <div key={i} className="mb-6">
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {items.map((item, i) => (
        <StackCard
          key={i}
          index={i}
          progress={scrollYProgress}
          range={[i / items.length, (i + 1) / items.length]}
          targetScale={1 - (items.length - 1 - i) * 0.04}
          gap={gap}
        >
          {item}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({
  children,
  index,
  progress,
  range,
  targetScale,
  gap,
}: {
  children: React.ReactNode;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  gap: number;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const opacity = useTransform(progress, range, [0.35, 1]);

  return (
    <div className="sticky" style={{ top: `calc(${index} * ${gap}rem)` }}>
      <motion.div
        style={{ scale, opacity, transformOrigin: "top center" }}
        className="border border-border bg-surface"
      >
        {children}
      </motion.div>
    </div>
  );
}
