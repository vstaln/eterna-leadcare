const REQUIRED = [
  "N8N_BASE_URL",
  "WEBHOOK_TOKEN",
  "EXECUTIONS_AUTH_TOKEN",
] as const;

export const NODE_ENV = process.env.NODE_ENV ?? "development";

function readEnv() {
  const values: Record<(typeof REQUIRED)[number], string> & {
    N8N_API_KEY: string;
    APPS_SCRIPT_URL: string;
    N8N_WEBHOOK_PATH: string;
  } = {
    N8N_BASE_URL: process.env.N8N_BASE_URL ?? "",
    WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN ?? "",
    EXECUTIONS_AUTH_TOKEN: process.env.EXECUTIONS_AUTH_TOKEN ?? "",
    N8N_API_KEY: process.env.N8N_API_KEY ?? "",
    APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL ?? "",
    N8N_WEBHOOK_PATH: process.env.N8N_WEBHOOK_PATH ?? "/webhook/lead",
  };
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
