"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const steps = [
  {
    element: "#hero",
    popover: {
      title: "This is Eterna LeadCare",
      description:
        "A lead-handling add-on for client websites: every form submission is checked, logged, and tracked live. This panel shows real data.",
    },
  },
  {
    element: "#live-panel",
    popover: {
      title: "Live data, not mockups",
      description:
        "The panel renders the real execution store — every lead, stage, state, and timestamp is genuine.",
    },
  },
  {
    element: "#about",
    popover: {
      title: "What LeadCare does",
      description:
        "Lead capture with a honeypot shield, signed dispatch through a workflow, and live reporting on the ops dashboard.",
    },
  },
  {
    element: "#role",
    popover: {
      title: "Why you can trust it",
      description:
        "A real store, named failures — N/R, PENDING, DEGRADED — and an open build you can inspect yourself.",
    },
  },
  {
    element: "#fit",
    popover: {
      title: "Every state is honest",
      description:
        "A lead either arrived, was blocked by the honeypot, or is still pending — and the dashboard names it, never fakes it.",
    },
  },
  {
    element: "#demo",
    popover: {
      title: "The pipeline, live",
      description:
        "Every recorded lead follows a visible path through intake, verification, dispatch, and storage — named stages, real states.",
    },
  },
  {
    element: "#ops-link",
    popover: {
      title: "The ops dashboard",
      description:
        "The live report card of every submission — real states, honest failures, nothing simulated.",
    },
  },
  {
    element: "#contact",
    popover: {
      title: "Try it",
      description:
        "Send a test lead — it travels the same path a real one would: checked, logged, and tracked live on the ops dashboard.",
    },
  },
];

export default function DriverTour() {
  useEffect(() => {
    const instance = driver({
      steps,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      popoverClass: "driver-popover",
      overlayColor: "rgba(9,9,11,0.85)",
      stagePadding: 8,
      allowClose: true,
      disableActiveInteraction: false,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
    });
    instance.drive();
    return () => {
      instance.destroy();
    };
  }, []);
  return null;
}
