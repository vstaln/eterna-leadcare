"use client";
import { FormEvent, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sentTracking, setSentTracking] = useState<string | null>(null);
  const [sentStatus, setSentStatus] = useState<string | null>(null);

  // The five stops a lead makes — same vocabulary as the home dashboard.
  // The first three are lit after a successful submit
  // (captured → shield passed → signed dispatch to n8n); LOGGED + LIVE are
  // where it lands next.
  const JOURNEY = ["CAPTURED", "SHIELD", "N8N", "LOGGED", "LIVE"] as const;

  function watchItMove() {
    document.getElementById("log")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          company: "Eterna hiring team",
          message: formData.get("message"),
          website: formData.get("website"), // honeypot — normally empty string
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Submission failed");
      setState("sent");
      // LeadCare promise: every accepted lead gets a tracking number the
      // terminal prints right here, instantly. Fall back to the raw id if
      // the API didn't return one (older deployments).
      setSentTracking(result.tracking ?? null);
      setSentStatus(result.status ?? "dispatched");
      setMessage(
        result.tracking
          ? `Received — shown live right here.`
          : `Received. Execution ID: ${result.executionId || "recorded"}`
      );
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit right now");
    }
  }

  return (
    <form onSubmit={submit} className="border border-border bg-surface p-6">
      {/* Honeypot bait: hidden from humans (display:none + off-screen), but a
          naive bot will happily fill it. The server rejects anyone who does
          (see /api/lead) and logs the attempt in the shield sidecar. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Reach me directly</p>
      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-muted">
            Your name
          </Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className="border-border bg-base text-text placeholder:text-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className="border-border bg-base text-text placeholder:text-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message" className="font-mono text-xs uppercase tracking-widest text-muted">
            Message <span className="normal-case tracking-normal">(optional)</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            maxLength={1000}
            placeholder="Interview slot, portfolio question, or feedback — anything helps."
            className="min-h-28 resize-y border-border bg-base text-text placeholder:text-muted/50"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 w-full bg-ok text-zinc-950 hover:bg-ok hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send me a message"}
      </Button>
      <p
        className={`mt-4 flex min-h-5 items-start gap-2 text-sm ${
          state === "error" ? "text-err" : state === "sent" ? "text-ok" : "text-muted"
        }`}
        role="status"
      >
        {state === "sent" && (
          <CheckCircle className="success-check mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>{message}</span>
      </p>
      {state === "sent" && sentTracking && (
        <div className="mt-3 border border-border bg-base px-3 py-3">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums">
            <span className="flex items-center gap-2">
              <span className="led-ok" aria-hidden="true" />
              <span className="text-muted">TRACKING</span>
              <span className="text-text">{sentTracking}</span>
            </span>
            <span className="ml-auto text-ok">{sentStatus?.toUpperCase()}</span>
          </p>
          <p
            className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-xs"
            aria-label="Where your lead goes next"
          >
            {JOURNEY.map((stop, i) => (
              <span key={stop} className={i < 3 ? "text-ok" : "text-muted"}>
                {stop}
                {i < JOURNEY.length - 1 ? " →" : ""}
              </span>
            ))}
          </p>
          <button
            type="button"
            onClick={watchItMove}
            className="mt-2.5 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live"
          >
            Watch it on the log ↓
          </button>
        </div>
      )}
    </form>
  );
}
