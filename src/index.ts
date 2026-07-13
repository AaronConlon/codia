import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import type { Context } from "hono";
import { createApp } from "./app.js";

const publicAsset = (filename: string) => new URL(`../public/${filename}`, import.meta.url);

const sendPngAsset = async (filename: string, c: Context) =>
  c.body(await readFile(publicAsset(filename)), 200, {
    "content-type": "image/png",
    "cache-control": "public, max-age=31536000, immutable",
  });

const app = createApp({ sendPngAsset });
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
