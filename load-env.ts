import { config } from "dotenv";
import { resolve } from "path";

/** Load `.env` then `.env.local` (Next.js-style) for CLI tools that don't use Next's env loader. */
export function loadLocalEnv(): void {
  config({ path: resolve(process.cwd(), ".env") });
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}
