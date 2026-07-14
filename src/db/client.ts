import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { resolveCodiaDbPath } from "./path.js";
import * as schema from "./schema.js";

const dbPath = resolveCodiaDbPath();
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export const rawSqlite = sqlite;
export const codiaDbPath = dbPath;
