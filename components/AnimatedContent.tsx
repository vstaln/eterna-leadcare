// AnimatedContent.tsx — scroll-triggered fade/slide-in wrapper (GSAP).
//
// Animates its children once when they enter the viewport (ScrollTrigger,
// start 'top 90%', once: true). A 3s fallback timer plays the animation if
// ScrollTrigger never fires, and prefers-reduced-motion renders content
// statically. The dialkit hook (useDialKit) lets the dev dial tune the
// default distance/duration live; explicit props win.
"use client";
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDialKit } from 'dialkit';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  ease?: string;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance,
  duration,
  ease = 'power3.out',
  className = '',
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dial = useDialKit('AnimatedContent', {
    distance: [12, 0, 100],
    duration: [0.5, 0.1, 1]
  });
  const dist = distance ?? dial.distance;
  const dur = duration ?? dial.duration;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(el, { y: dist, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(el, {
      y: 0,
      opacity: 1,
      duration: dur,
      ease
    });

    let played = false;

    const play = () => {
      if (played) return;
      played = true;
      tl.play();
    };

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: window,
      start: 'top 90%',
      once: true,
      onEnter: play
    });

    const fallbackId = window.setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) play();
    }, 3000);

    return () => {
      window.clearTimeout(fallbackId);
      st.kill();
      tl.kill();
    };
  }, [dist, dur, ease]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
