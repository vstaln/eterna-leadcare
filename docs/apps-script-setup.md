# Apps Script setup — ET-48 OPS leads log

One Google Apps Script endpoint that appends `[DEMO]` rows to a spreadsheet. It is the **audit-trail leg** of the pipeline: after N8N enriches a lead (RDAP), it calls this endpoint, and the row lands in the sheet — the honest record of every demo execution.

Why only this, and why GET: RDAP enrichment runs inside N8N (public data, no secret), so this script has exactly one job. It is deployed as "Anyone" access, and Apps Script **blocks POST for anonymous deployments** — only `doGet` works — so the endpoint takes query parameters. The shared token is the gate; without it every call returns 401.

## 1. Create the spreadsheet

1. Open https://sheets.new — name it **ET-48 OPS — leads**
2. Rename the first tab to **DEMO leads** (or leave it; the script creates the tab if missing)
3. Keep this tab open for the next step

## 2. Add the script

1. In the spreadsheet: **Extensions → Apps Script**
2. Delete the default `function myFunction() {}` and paste:

```js
const SHEET_NAME = "DEMO leads";

function setToken() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("APPS_SCRIPT_TOKEN", "PASTE_YOUR_TOKEN_HERE");
  Logger.log("token set");
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      "tag", "ts", "executionId", "name", "email", "company",
      "domain", "registrar", "created", "updated", "status", "nameservers",
    ]);
  }
  return sh;
}

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty("APPS_SCRIPT_TOKEN");
  if (!e.parameter.token || e.parameter.token !== expected) {
    return json_(401, { ok: false, error: "unauthorized" });
  }
  if (e.parameter.action !== "log") {
    return json_(400, { ok: false, error: "bad action" });
  }
  const p = e.parameter;
  getSheet_().appendRow([
    "DEMO", new Date().toISOString(), p.executionId || "", p.name || "",
    p.email || "", p.company || "", p.domain || "", p.registrar || "",
    p.created || "", p.updated || "", p.status || "", p.nameservers || "",
  ]);
  return json_(200, { ok: true, row: "appended" });
}

function json_(code, obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Save (Ctrl+S / Cmd+S)

## 3. Set the token

1. In the script editor, edit `setToken()`: replace `PASTE_YOUR_TOKEN_HERE` with the token from the box's `/opt/eterna/.env` (`APPS_SCRIPT_TOKEN=...`)
2. Run `setToken` once (select it from the dropdown, click Run) — allow the authorization dialog
3. Delete the token from the code afterward (it lives in Script Properties now) and save

## 4. Deploy

1. **Deploy → New deployment → Web app**
2. Execute as: **Me** · Who has access: **Anyone**
3. Copy the **Web app URL** — it ends in `/exec`
4. Put it in the box env: `ssh oracle-old` → edit `/opt/eterna/.env` → `APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec` → `cd /opt/eterna && docker compose up -d` (recreates with the new env)

## 5. Verify from the phone (works after deploy)

```sh
# with token (200) — note Content-Type: text/plain; a JSON content-type triggers Apps Script's 302-reject:
curl -s -H 'Content-Type: text/plain' "https://script.google.com/macros/s/<YOUR_ID>/exec?action=log&token=<TOKEN>&executionId=test-001&name=Vstalin&email=vstal@vstal.in&domain=vstal.in"
# → {"ok":true,"row":"appended"}

# wrong token (401):
curl -s -H 'Content-Type: text/plain' "https://script.google.com/macros/s/<YOUR_ID>/exec?action=log&token=wrong"
# → {"ok":false,"error":"unauthorized"}
```

## What a [DEMO] row looks like

| tag | ts | executionId | name | email | company | domain | registrar | created | updated | status | nameservers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEMO | 2026-08-06T13:45:00Z | a1b2c3d4… | Vstalin | vstal@vstal.in | Vstal Inc | vstal.in | NameCheap, Inc. | 2016-01-01 | 2026-01-01 | clientTransferProhibited | a.registrar-servers.com, b.registrar-servers.com |

## Honest notes

- Access "Anyone" means anyone with the URL can call it — the token is the gate. If the token leaks, rotate it in Script Properties.
- The sheet tab is prefixed `DEMO` on every row; this is a demo pipeline, the rows are real executions of it.
- No RDAP here — N8N does the enrichment and passes the fields through.
