import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { createCodeController } from "./routes/code/code-controller.js";
import { createSiteController } from "./routes/site/site-controller.js";

type CreateAppOptions = {
  sendPublicAsset?: (filename: string, c: Context) => Response | Promise<Response>;
  codeInspectorScript?: string;
};

export const createApp = (options: CreateAppOptions = {}) => {
  const app = new OpenAPIHono();
  const version = process.env.OVO_RELEASE_VERSION || process.env.APP_VERSION || "dev";
  const commit = process.env.OVO_RELEASE_COMMIT || process.env.GITHUB_SHA || "";

  createSiteController(app);

  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      name: "Codia",
      version,
      commit,
      checkedAt: new Date().toISOString(),
    }),
  );

  if (options.sendPublicAsset) {
    app.get("/favicon.png", (c) => options.sendPublicAsset?.("favicon.png", c) ?? c.notFound());
    app.get("/favicon.ico", (c) => options.sendPublicAsset?.("favicon.png", c) ?? c.notFound());
    app.get("/assets/codia-logo.png", (c) =>
      options.sendPublicAsset?.("codia-logo.png", c) ?? c.notFound(),
    );
    app.get("/assets/codia-logo.webp", (c) =>
      options.sendPublicAsset?.("codia-logo.webp", c) ?? c.notFound(),
    );
    app.get("/og-image.png", (c) => options.sendPublicAsset?.("codia-og.png", c) ?? c.notFound());
  }

  createCodeController(app, {
    codeInspectorScript: options.codeInspectorScript,
  });

  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Codia API",
      version: "0.1.0",
      description: "Beautiful code images for humans and APIs.",
    },
  });

  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  return app;
};
