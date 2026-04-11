import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { loadLocalEnv } from "@/load-env";

import * as schema from "./schema";

loadLocalEnv();

declare global {
  // eslint-disable-next-line no-var -- HMR singleton in dev
  var __hw_drizzle_db__: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

export const db = globalThis.__hw_drizzle_db__ ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalThis.__hw_drizzle_db__ = db;
}

export type Database = typeof db;
