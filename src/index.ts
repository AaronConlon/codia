import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import type { Context } from "hono";
import { createApp } from "./app.js";

const publicAsset = (filename: string) => new URL(`../public/${filename}`, import.meta.url);

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

const app = createApp({ sendPublicAsset });
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
