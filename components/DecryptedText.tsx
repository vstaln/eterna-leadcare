"use client";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  reverse?: boolean;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  encryptedClassName?: string;
  animateOn?: "view" | "hover";
  className?: string;
  onComplete?: () => void;
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 8,
  sequential = false,
  reverse = false,
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARS,
  encryptedClassName = "",
  animateOn = "view",
  className = "",
  onComplete,
}: DecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const chars = useOriginalCharsOnly
    ? Array.from(new Set(text.split("")))
    : characters.split("");

  const startScramble = () => {
    setStartTime(performance.now());
    setIsScrambling(true);
  };

  useEffect(() => {
    if (isComplete) return;
    if (animateOn === "hover") {
      const el = ref.current;
      if (!el) return;
      el.addEventListener("mouseenter", startScramble);
      return () => el.removeEventListener("mouseenter", startScramble);
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startScramble();
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateOn, isComplete]);

  useEffect(() => {
    if (!isScrambling) return;
    const interval = setInterval(() => {
      const progress = (performance.now() - startTime) / (speed * maxIterations);
      if (progress >= 1) {
        setDisplayText(text);
        setIsScrambling(false);
        setIsComplete(true);
        onComplete?.();
        clearInterval(interval);
        return;
      }
      const revealed = Math.floor(progress * text.length);
      setDisplayText(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return char;
            if (sequential && i < revealed) return char;
            if (reverse && i >= text.length - revealed) return char;
            if (!sequential && !reverse && Math.random() < progress) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
    }, speed);
    return () => clearInterval(interval);
  }, [isScrambling, startTime, text, speed, maxIterations, sequential, reverse, chars, onComplete]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {displayText.split("").map((char, i) => (
          <span key={i} className={char !== text[i] ? encryptedClassName : undefined}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
