"use client";
import React, { useRef, useState } from 'react';
import { useDialKit } from 'dialkit';

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const dial = useDialKit('SpotlightCard', {
    hoverOpacity: [0.6, 0, 1]
  });
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [pointerFine] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  const handlePointerEnterOrMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (divRef.current && !isFocused) {
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setOpacity(dial.hoverOpacity);
  };

  const handlePointerLeaveOrBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseEnter={pointerFine ? handlePointerEnterOrMove : undefined}
      onMouseMove={pointerFine ? handlePointerEnterOrMove : undefined}
      onMouseLeave={handlePointerLeaveOrBlur}
      onBlur={handlePointerLeaveOrBlur}
      className={`relative border border-border bg-surface overflow-hidden p-8 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          transition: `opacity ${
            opacity > 0 ? 'var(--duration-quick)' : 'var(--duration-fast)'
          } var(--ease-smooth-out)`
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
