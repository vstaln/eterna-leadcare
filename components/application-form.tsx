"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: "Eterna hiring team",
          message: form.get("message"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Submission failed");
      setState("sent");
      setMessage(`Received. Execution ID: ${result.executionId || "recorded"}`);
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit right now");
    }
  }

  return (
    <form onSubmit={submit} className="border border-border bg-surface p-6">
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
        className={`mt-4 min-h-5 text-sm ${
          state === "error" ? "text-err" : state === "sent" ? "text-ok" : "text-muted"
        }`}
        role="status"
      >
        {message}
      </p>
    </form>
  );
}
