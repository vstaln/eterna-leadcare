# AI_LOG.md — Cursor / OpenCode session log

Append-only. One entry per work block (~2-4h). Format: goal → real prompt snippet → files changed → verification. Failures and rejections are logged too — the log is the evidence.

## S001 — Repo bootstrap (OpenCode, ~45 min)

- Goal: stand up the project repo + skeleton so CI and git history start clean.
- Prompt: "Create public GitHub repo eterna-ops-command-center for user vstaln, apply branch protection on main (enforce admins, linear history, no force push, no deletions), clone locally, and seed README.md, .gitignore (secrets), and a conventional-commit template."
- Tooling note: repo ops done via GitHub REST API (curl with PAT) because the GitHub MCP server was added to opencode mid-session; MCP will be used from S002 onward.
- Changed: repo vstaln/eterna-ops-command-center (created, protected), README.md, .gitignore, .gitmessage, this file.
- Verified: `git branch --show-current` → main; API returned protection settings (enforce_admins enabled, linear_history enabled, force_pushes/deletions disabled).

## Template

### S00N — <short title> (<tool>, ~<time>)

- Goal: ...
- Prompt: ...
- Changed: ...
- Verified: ...
