# Eterna LeadCare — HR Script

Everything you need to explain LeadCare to a non-technical person (HR, a
client, anyone), in under 60 seconds. This file is the single source of
truth for the pitch — the home page copy mirrors it.

---

## 10-second elevator

> "Eterna LeadCare: every lead a client gets is checked for spam, saved, and
> logged — with a tracking number they can follow live."

## The one-line pitch

> "Eterna LeadCare — automatic lead handling for client websites."

## The 3-sentence story (say this to HR)

> "Eterna LeadCare is a simple add-on for any client website: when someone
> fills in a form, we block the spam, save who they are, and log the lead.
> The client gets a live dashboard where every lead arrives, gets checked,
> and gets recorded — nothing hidden, nothing faked. Every lead comes with a
> tracking number, so the client can always see where it is."

---

## The jargon → plain-English table

| What it is technically | What we call it | What it actually does |
|------------------------|-----------------|------------------------|
| Web form + typed API | **Captured** | The moment a lead arrives, it gets a timestamp |
| Honeypot trap + signature checks | **Spam Shield** | Blocks bots; every blocked attempt is counted and shown |
| n8n workflow + RDAP lookup | **Researched** | Looks up who's contacting you (real company, real domain) |
| Execution store + Sheets receipt | **Logged** | Every lead written down permanently, client-visible |
| Ops dashboard | **Live** | Watch every lead move, live — or see honestly what's waiting |

## Why every skill in the JD fits

- **Webflow** → the client-facing one-pager (this product's landing page)
- **Next.js / React / TypeScript** → the intake + live dashboard
- **N8N** → the assembly line that connects everything
- **Google Apps Script + Sheets** → the permanent receipt
- **Oracle Cloud + Docker** → the always-on worker
- **AI-assisted development** → built with AI, and it's *about* automating human work

---

## Objections and honest answers

**"What if a form gets spammed?"**
> "The form carries a hidden honeypot field — bots that fill it are counted
> in the shield log and never become leads. You see the number blocked."

**"How do I know it's real?"**
> "The dashboard renders the actual store — every row is a real submission
> with a tracking number, failures are named, and the build is documented
> behind the scenes. Nothing is simulated."

**"What if the pipeline fails?"**
> "A failed row shows why — rejected by the research step or unreachable —
> and the ops ledger lists exactly what is pending. No silent drops."

**"Is it secure?"**
> "Requests are signed with a short-lived signature and checked with a
> timing-safe comparison; the honeypot traps bots; the log endpoints are
> token-gated. What we can't claim, we say so on the page."

**"Who maintains it?"**
> "Right now it's a $0/month demo built in 48 hours. In production, that's
> exactly the managed team Eterna sells — people who run, watch, and re-queue
> the pipeline for the client."

---

## Proof points (all verifiable live)

- Live dashboard: **https://eterna.vstal.in/ops** — real store rows, named stages, shield log
- Tracking numbers on every accepted lead (ELC-2026-XXXXX)
- Source + build log: github.com/vstaln/eterna-ops-command-center
- Built from a phone, in 48 hours, at $0/month
