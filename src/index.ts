import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import type { Context } from "hono";
import { createApp } from "./app.js";
import { migrateDatabase } from "./db/migrate.js";

const publicAsset = (filename: string) => new URL(`../public/${filename}`, import.meta.url);
const isProduction = process.env.NODE_ENV === "production";

const contentTypes: Record<string, string> = {
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".webp": "image/webp",
};

const sendPublicAsset = async (filename: string, c: Context) => {
  const extension = filename.slice(filename.lastIndexOf("."));

  return c.body(await readFile(publicAsset(filename)), 200, {
    "content-type": contentTypes[extension] ?? "application/octet-stream",
    "cache-control": "public, max-age=31536000, immutable",
  });
};

const createCodeInspectorScript = async () => {
  if (isProduction || process.env.CODE_INSPECTOR === "false") return undefined;

  const { getWebComponentCode, startServer } = await import("@code-inspector/core");
  const options = {
    bundler: "vite" as const,
    editor: "zed" as const,
    launchType: "open" as const,
    port: Number(process.env.CODE_INSPECTOR_PORT ?? 5678),
    hideConsole: true,
    showSwitch: false,
    lang: "zh" as const,
    dev: true,
  };
  const record = {
    port: options.port,
    entry: "src/index.ts",
    output: ".code-inspector",
  };

  await startServer(options, record);

  return getWebComponentCode(options, record.port);
};

migrateDatabase();

const app = createApp({
  sendPublicAsset,
  codeInspectorScript: await createCodeInspectorScript(),
});
const port = Number(process.env.PORT ?? 3000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
