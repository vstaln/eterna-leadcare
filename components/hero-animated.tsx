"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useDialKit } from "dialkit";
import SplitText from "@/components/SplitText";

export function HeroHeadline() {
  const reduced = useReducedMotion();
  const dial = useDialKit("SplitText", {
    delay: [30, 0, 180],
    duration: [0.45, 0.1, 0.9],
    distance: [10, 0, 40],
  });
  if (reduced) {
    return (
      <h1 className="max-w-5xl text-balance text-[clamp(3rem,7vw,5.75rem)] font-semibold leading-[1.05] tracking-tighter text-text">
        Every lead, checked, logged, shown live.
      </h1>
    );
  }
  return (
    <SplitText
      text="Every lead, checked, logged, shown live."
      tag="h1"
      textAlign="left"
      className="max-w-5xl text-balance text-[clamp(3rem,7vw,5.75rem)] font-semibold leading-[1.05] tracking-tighter text-text"
      splitType="words"
      delay={dial.delay}
      duration={dial.duration}
      from={{ opacity: 0, y: dial.distance }}
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
  const [pointerFine] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const rotateX = useSpring(useMotionValue(0), { damping: 25, stiffness: 160, mass: 1 });
  const rotateY = useSpring(useMotionValue(0), { damping: 25, stiffness: 160, mass: 1 });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!pointerFine) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * 2.5);
    rotateY.set(px * 2.5);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={pointerFine ? onMove : undefined}
      onMouseLeave={pointerFine ? onLeave : undefined}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
