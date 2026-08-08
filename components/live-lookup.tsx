"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LiveLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = value.trim().toUpperCase();
    if (code) router.push(`/live?tracking=${encodeURIComponent(code)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ELC-2026-XXXXX"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Tracking number"
        className="w-full border border-border bg-surface px-4 py-3 font-mono text-sm text-text placeholder:text-muted/50 focus-visible:outline-2 focus-visible:outline-live sm:flex-1"
      />
      <button
        type="submit"
        className="stamp stamp-red press shrink-0 text-sm"
      >
        Look it up
      </button>
    </form>
  );
}
