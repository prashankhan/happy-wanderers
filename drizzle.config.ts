import { defineConfig } from "drizzle-kit";

import { loadLocalEnv } from "./load-env";

loadLocalEnv();

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
