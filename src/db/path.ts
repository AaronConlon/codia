import { join, resolve } from "node:path";

const defaultDbDir = "data";
const defaultDbFile = "codia.sqlite";

export const resolveCodiaDbPath = () => {
  const dbDir = process.env.DATABASE_DIR?.trim() || defaultDbDir;
  return resolve(join(dbDir, defaultDbFile));
};
