import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "executions.json");
const CAP = 100;

export type Execution = {
  id: string;
  status: "received" | "dispatched" | "failed";
  stage: string;
  created_at: string;
  updated_at: string;
  error?: string;
};

async function load(): Promise<Execution[]> {
  // No module-level cache: Next.js may hold separate module instances for
  // pages vs route handlers (and separate processes in multi-instance
  // deploys). A stale in-memory copy made pages serve old rows forever —
  // new leads never showed up on the dashboard and lookups said "no such
  // tracking". The ring is capped at 100 rows (~KB), so a fresh read per
  // call is cheap and always honest.
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Execution[];
  } catch {
    return []; // missing or corrupt file = no executions yet (honest zero)
  }
}

async function persist(list: Execution[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}

export async function createExecution(
  id: string,
  status: Execution["status"],
  stage: string
) {
  const list = await load();
  const now = new Date().toISOString();
  list.unshift({ id, status, stage, created_at: now, updated_at: now });
  if (list.length > CAP) list.length = CAP;
  await persist(list);
}

export async function updateExecution(
  id: string,
  patch: Partial<Pick<Execution, "status" | "stage" | "error">>
) {
  const list = await load();
  const row = list.find((r) => r.id === id);
  if (!row) return false;
  Object.assign(row, patch, { updated_at: new Date().toISOString() });
  await persist(list);
  return true;
}

export async function listExecutions(limit: number) {
  const list = await load();
  return list.slice(0, limit);
}
