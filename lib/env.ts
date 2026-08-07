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

export const env = readEnv();
