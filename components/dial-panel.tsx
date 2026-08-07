"use client";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";

export default function DialPanel() {
  if (process.env.NODE_ENV === "production") return null;
  return <DialRoot position="bottom-right" />;
}
