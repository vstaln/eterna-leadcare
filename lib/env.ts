// env.ts — typed, fail-fast access to process.env for the whole app.
//
// WHY: the pipeline's honesty depends on known configuration. REQUIRED_DEFS
// (N8N_BASE_URL, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN) are enforced in
// production — if any is missing the app refuses to boot rather than run
// half-configured. Everything else (APPS_SCRIPT_URL, N8N_API_KEY,
// N8N_WEBHOOK_PATH) is optional and degrades honestly (stage probes report
// N/R / CONFIGURED / DEGRADED instead of faking green).

const REQUIRED_DEFS = {
  N8N_BASE_URL: "",
  WEBHOOK_TOKEN: "",
  EXECUTIONS_AUTH_TOKEN: "",
} as const;

const ENV_DEFS = {
  ...REQUIRED_DEFS,
  N8N_API_KEY: "",
  APPS_SCRIPT_URL: "",
  N8N_WEBHOOK_PATH: "/webhook/lead",
} as const;

export const NODE_ENV = process.env.NODE_ENV ?? "development";

const REQUIRED = Object.keys(REQUIRED_DEFS) as (keyof typeof ENV_DEFS)[];

function readEnv(): Record<keyof typeof ENV_DEFS, string> {
  const values: Record<keyof typeof ENV_DEFS, string> = { ...ENV_DEFS };
  for (const key of Object.keys(ENV_DEFS) as (keyof typeof ENV_DEFS)[]) {
    const actual = process.env[key];
    if (actual !== undefined) values[key] = actual;
  }
  return values;
}

export function validateEnv() {
  const values = readEnv();
  if (NODE_ENV === "production") {
    const missing = REQUIRED.filter((key) => values[key] === "");
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }
  return values;
}

// readEnv() snapshots process.env ONCE at module load. In Next.js that is
// per-process, which is fine: env is static at runtime for a given container.
export const env = readEnv();
