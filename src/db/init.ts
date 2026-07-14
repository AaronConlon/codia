import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { resolveCodiaDbPath } from "./path.js";

const codiaDbPath = resolveCodiaDbPath();
const existed = existsSync(codiaDbPath);

if (existed) {
  console.log(`[codia] sqlite already exists, skip first init: ${codiaDbPath}`);
  process.exit(0);
}

const { migrateDatabase } = await import("./migrate.js");
migrateDatabase();

console.log(`[codia] sqlite initialized: ${codiaDbPath}`);
console.log(`[codia] sqlite directory: ${dirname(codiaDbPath)}`);
