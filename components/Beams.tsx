"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COLORS = ["#2f855a", "#b7791f", "#b0413e", "#5f5a4a"];

interface Beam {
  angle: number;
  length: number;
  width: number;
  color: string;
  speed: number;
}

function hexA(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export default function Beams({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let beams: Beam[] = [];
    let raf = 0;

    const spawn = () => {
      beams = Array.from({ length: 14 }, (_, i) => ({
        angle: (i / 14) * Math.PI * 2 + Math.random() * 0.3,
        length: 0.35 + Math.random() * 0.65,
        width: 1 + Math.random() * 2.5,
        color: COLORS[i % COLORS.length],
        speed: 0.8 + Math.random() * 0.4,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    };

    const draw = (t: number, animate: boolean) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.max(w, h) * 1.2;
      for (const b of beams) {
        const angle = b.angle + (animate ? t * 0.00005 * b.speed : 0);
        const ex = cx + Math.cos(angle) * radius * b.length;
        const ey = cy + Math.sin(angle) * radius * b.length;
        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        grad.addColorStop(0, hexA(b.color, 0.09));
        grad.addColorStop(1, hexA(b.color, 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = b.width;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.35);
      glow.addColorStop(0, hexA(COLORS[0], 0.06));
      glow.addColorStop(1, hexA(COLORS[0], 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (t: number) => {
      draw(t, true);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw(0, false);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
}
