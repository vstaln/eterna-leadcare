// utils.ts — the shadcn-style `cn` helper: merge Tailwind classes with
// clsx, then dedupe/resolve conflicts with tailwind-merge (last one wins).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
