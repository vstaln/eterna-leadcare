// dial-panel.tsx — dialkit's dev-only tweak panel (bottom-right corner).
//
// Renders nothing in production (guard below); in dev it lets the operator
// adjust GSAP/motion defaults live (AnimatedContent reads from it via
// useDialKit).
"use client";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";

export default function DialPanel() {
  if (process.env.NODE_ENV === "production") return null;
  return <DialRoot position="bottom-right" />;
}
