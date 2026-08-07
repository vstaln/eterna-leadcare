"use client";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import SplitText from "@/components/SplitText";

export function HeroHeadline() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <h1 className="max-w-3xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tighter text-text">
        I am applying for the Lead Automation &amp; Web Engineer role.
      </h1>
    );
  }
  return (
    <SplitText
      text="I am applying for the Lead Automation & Web Engineer role."
      tag="h1"
      textAlign="left"
      className="max-w-3xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tighter text-text"
      splitType="words, chars"
      delay={25}
      duration={1.15}
      from={{ opacity: 0, y: 32 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.05}
    />
  );
}

export function PanelTilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { damping: 25, stiffness: 160, mass: 1 });
  const rotateY = useSpring(useMotionValue(0), { damping: 25, stiffness: 160, mass: 1 });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * 5);
    rotateY.set(px * 5);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
