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

let cache: Execution[] | null = null;

async function load(): Promise<Execution[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    cache = JSON.parse(raw) as Execution[];
  } catch {
    cache = [];
  }
  return cache;
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
  cache = list;
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
  cache = list;
  await persist(list);
  return true;
}

export async function listExecutions(limit: number) {
  const list = await load();
  return list.slice(0, limit);
}
