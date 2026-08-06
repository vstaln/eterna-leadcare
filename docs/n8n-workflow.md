# N8N workflow — ET-48 lead pipeline

Export: `docs/n8n-workflow.json` · Workflow ID: `e5336198-9ef1-46e5-8746-4681e17aba1f` · Imported on `oracle-old` (n8n 1.123.69, container `eterna-n8n-1`, active).

## What it does

Verifies the HMAC signature the Next.js proxy (`/api/lead`) computed over `executionId.nonce.ts`, enriches the lead's email domain via RDAP, maps the enrichment fields, calls the token-gated Apps Script log endpoint, and answers the webhook.

## Environment (box `/opt/eterna/.env`, not the repo)

| Variable | Use |
| --- | --- |
| `WEBHOOK_TOKEN` | shared secret for the HMAC verify step (same as the phone) |
| `APPS_SCRIPT_URL` | Apps Script web-app URL; when unset the log leg fails and the run answers the **degraded** response |
| `APPS_SCRIPT_TOKEN` | token passed to the Apps Script endpoint |

## Diagram

```
POST /webhook/<workflow-id>/lead/lead          (headers X-Nonce, X-Ts, X-HMAC; JSON body)
  │
  ▼
Lead (webhook, responseNode)
  │
  ▼
Verify HMAC (Code, pure-JS SHA-256/HMAC, timing-safe compare, 5-min freshness)
  │
  ▼
Signature OK? (IF) ── false / error ──────────► Respond 401  {"ok":false,"error":<rejectReason>}
  │ true
  ▼
RDAP Enrich (HTTP GET rdap.org/domain/<domain>) ── error (e.g. 404 unknown domain) ──► continue (onError)
  │
  ▼
Map Log Params (Code)
  │
  ▼
Apps Script Log (HTTP GET $env.APPS_SCRIPT_URL?action=log&token=...)
  │ success                                  │ error (e.g. empty APPS_SCRIPT_URL)
  ▼                                          ▼
Respond 200                        Respond Degraded
{"ok":true,"executionId":...}      200 {"ok":false,"error":...}
```

## Response contract

- Valid signature, fresh timestamp, log leg OK → **200** `{"ok":true,"executionId":...}`.
- Valid signature but the Apps Script log leg fails → **200** `{"ok":false,"error":...}` — honest degraded response; upgrades to `ok:true` once `APPS_SCRIPT_URL` is deployed per `docs/apps-script-setup.md`.
- Bad signature or stale timestamp → **401** `{"ok":false,"error":"bad signature"|"stale timestamp"}`.
- Unknown domain never 500s: the RDAP request node continues on error and the run still answers.

## Ops notes

- Headless import/activation: `docker exec eterna-n8n-1 n8n import:workflow --input=/home/node/workflows/eterna-lead.json` then `n8n update:workflow --id=e5336198-9ef1-46e5-8746-4681e17aba1f --active=true`, then `docker restart eterna-n8n-1`.
- The webhook node has `responseMode: responseNode` — responses come only from the Respond nodes.
