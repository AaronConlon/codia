#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
const env = process.env;

const buildTag =
  env.CODIA_BUILD_TAG ||
  env.OVO_RELEASE_VERSION ||
  env.APP_VERSION ||
  env.GITHUB_REF_NAME ||
  `v${packageJson.version}`;
const buildDate = env.CODIA_BUILD_DATE || new Date().toISOString();
const outputPath = join(rootDir, "src", "generated", "build-info.ts");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  [
    "export const codiaBuildInfo = {",
    `  date: ${JSON.stringify(buildDate)},`,
    `  tag: ${JSON.stringify(buildTag)},`,
    "} as const;",
    "",
  ].join("\n"),
);

console.log(`build_info_date=${buildDate}`);
console.log(`build_info_tag=${buildTag}`);
