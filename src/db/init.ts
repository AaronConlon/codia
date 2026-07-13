import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const codiaDbPath = resolve(process.env.CODIA_DB_PATH || "data/codia.sqlite");
const existed = existsSync(codiaDbPath);

if (existed) {
  console.log(`[codia] sqlite already exists, skip first init: ${codiaDbPath}`);
  process.exit(0);
}

const { migrateDatabase } = await import("./migrate.js");
migrateDatabase();

console.log(`[codia] sqlite initialized: ${codiaDbPath}`);
console.log(`[codia] sqlite directory: ${dirname(codiaDbPath)}`);
