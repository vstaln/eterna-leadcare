"use client";
import { useReducedMotion } from "motion/react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

export default function ShinyText({ text, disabled = false, className = "" }: ShinyTextProps) {
  const reduced = useReducedMotion();
  if (disabled || reduced) {
    return <span className={className}>{text}</span>;
  }
  return <span className={`shiny-text ${className}`}>{text}</span>;
}
