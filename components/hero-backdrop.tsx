// hero-backdrop.tsx — CSS-only backdrop for the hero: a faint console dot
// grid with two slow-drifting glows. No canvas, no JS animation loop —
// respects prefers-reduced-motion via globals.css.

export default function HeroBackdrop() {
  return <div className="hero-backdrop" aria-hidden="true" />;
}
