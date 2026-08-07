"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const steps = [
  {
    element: "#hero",
    popover: {
      title: "This is my application",
      description:
        "I am Vstalin, and I am applying for Eterna Indonesia's Lead Automation & Web Engineer role.",
    },
  },
  {
    element: "#live-panel",
    popover: {
      title: "Live data, not mockups",
      description:
        "This panel is real data from the live automation pipeline — every execution, state, and timestamp is genuine.",
    },
  },
  {
    element: "#about",
    popover: {
      title: "About me",
      description:
        "Who I am and the three skill areas I would bring: web engineering, automation, and cloud + AI.",
    },
  },
  {
    element: "#role",
    popover: {
      title: "The role I am applying for",
      description:
        "The exact role and terms I am applying for: fully remote, full-time, U.S.-based client, Rp13M–Rp18M.",
    },
  },
  {
    element: "#fit",
    popover: {
      title: "Why I am a strong fit",
      description:
        "Each responsibility in the job description mapped to something I can point at as evidence.",
    },
  },
  {
    element: "#demo",
    popover: {
      title: "My automation, live",
      description:
        "A working automation pipeline: intake, verification, dispatch, storage, and a report card. Every step is visible.",
    },
  },
  {
    element: "#ops-link",
    popover: {
      title: "The ops dashboard",
      description:
        "This opens the live report card of every submission — real states, honest failures, nothing simulated.",
    },
  },
  {
    element: "#contact",
    popover: {
      title: "Contact me",
      description:
        "If you are on the hiring team, you can reach me here. It runs through the same pipeline this site demonstrates.",
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
