# ARCHITECTURE.md

Filled in during the build (decision log, data-flow diagram, security notes, runbook). See plan:

```
Browser → Next.js API route (/api/run-demo) → webhook → N8N (Oracle VM, Docker)
        → Google Apps Script (RDAP enrich + Sheets log) + Telegram → report card
        → frontend polls /api/executions → animated pipeline diagram
```

Deploy: GitHub Actions → multi-arch Docker (GHCR) → GCP Cloud Run → eterna.vstal.in.

Job-requirement mapping table lands here when the app scaffold is done.
