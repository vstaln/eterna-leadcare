"use client";
import { lazy, Suspense, useCallback, useState } from "react";
import { Compass } from "lucide-react";

const DriverTour = lazy(() => import("@/components/driver-tour"));

export default function TourTrigger({ variant = "cta" }: { variant?: "cta" | "nav" }) {
  const [started, setStarted] = useState(false);
  const start = useCallback(() => setStarted(true), []);

  const classes =
    variant === "nav"
      ? "inline-flex items-center gap-1.5 text-sm font-medium text-text transition-colors duration-150 hover:text-live focus-visible:outline-2 focus-visible:outline-live"
      : "inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live";

  return (
    <>
      <button type="button" onClick={start} aria-label="Start guided tour of this application" className={classes}>
        <Compass className={variant === "nav" ? "h-4 w-4 text-muted" : "h-4 w-4 text-live"} aria-hidden="true" />
        <span>{variant === "nav" ? "Tour" : "60-second tour"}</span>
      </button>
      {started && (
        <Suspense fallback={null}>
          <DriverTour />
        </Suspense>
      )}
    </>
  );
}
