"use client";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeStrength?: number;
  className?: string;
}

export default function Magnet({
  children,
  padding = 24,
  disabled = false,
  magnetStrength = 2,
  activeStrength = 1.5,
  className = "",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  if (reduced || disabled) {
    return <div className={className}>{children}</div>;
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const strength = isActive ? activeStrength : magnetStrength;
    setPosition({
      x: (event.clientX - centerX) / strength,
      y: (event.clientY - centerY) / strength,
    });
  }

  function onLeave() {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: "transform 120ms var(--ease-smooth-out)",
        padding,
      }}
    >
      {children}
    </div>
  );
}
