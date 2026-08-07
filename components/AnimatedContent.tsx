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
    distance: [100, 0, 300],
    duration: [0.8, 0.1, 3]
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
      duration,
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

    const fallbackId = window.setTimeout(play, 3000);

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
