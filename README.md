# Eterna Ops Command Center

Live automation showcase at **[https://eterna.vstal.in](https://eterna.vstal.in)** — a working miniature of the EMPWR-style webhook integrations Eterna ships for US clients: visitor lead form → Next.js API → self-hosted N8N → Google Apps Script enrichment + Sheets logging → Telegram notify → live report card.

Built in 48 hours, $0/month free tier, with Cursor + OpenCode. Every step's story is in `AI_LOG.md`.

## Live links

- Main app: https://eterna.vstal.in
- Live Ops (real executions): /ops
- Behind the Scenes (git log + CI + AI_LOG + $0 cost): /behind-the-scenes
- Webflow no-code landing: https://eterna-ops.webflow.io

## What it proves

Webflow / N8N / Google Apps Script / React / Next.js / Node.js / type-safe TypeScript / Docker / CI/CD / GCP Cloud Run / Oracle Cloud · Git / version control / Cursor + OpenCode AI workflow / k3s stretch. Mapping table in `ARCHITECTURE.md`.

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind) — deployed via GitHub Actions → GHCR → GCP Cloud Run (free tier; Vercel fallback documented)
- N8N (community, self-hosted) — Docker Compose on Oracle Cloud Always Free Ampere A1 ARM64 VM, Caddy TLS
- Google Apps Script + Google Sheets — RDAP/domain enrichment + lead audit trail
- Webflow free plan — no-code landing proof
- CI/CD: `deploy.yml` on push to `main`

## Quickstart

```sh
# app
npm ci
npm run dev            # http://localhost:3000

# N8N (on the Oracle VM — see docker-compose.yml)
docker compose up -d
```

## Repo layout

symlink to `ARCHITECTURE.md` for the data-flow diagram, decision log, security notes, and runbook. `AI_LOG.md` is the per-session Cursor/OpenCode prompt log.

## Cost

$0/month. Itemized on /behind-the-scenes.