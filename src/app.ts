import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { createCodeController } from "./routes/code/code-controller.js";

type CreateAppOptions = {
  sendPngAsset?: (filename: string, c: Context) => Response | Promise<Response>;
};

export const createApp = (options: CreateAppOptions = {}) => {
  const app = new OpenAPIHono();

  app.get("/", (c) =>
    c.json({
      name: "Codia",
      slogan: "Beautiful Code Images for Humans and APIs.",
      example: "/example",
      llms: "/llms.txt",
      docs: "/docs",
      openapi: "/openapi.json",
      repository: "https://github.com/AaronConlon/codia",
      author: "https://x.com/intent/follow?screen_name=aaronconlondev",
    }),
  );

  if (options.sendPngAsset) {
    app.get("/favicon.png", (c) => options.sendPngAsset?.("favicon.png", c) ?? c.notFound());
    app.get("/favicon.ico", (c) => options.sendPngAsset?.("favicon.png", c) ?? c.notFound());
    app.get("/assets/codia-logo.png", (c) =>
      options.sendPngAsset?.("codia-logo.png", c) ?? c.notFound(),
    );
    app.get("/og-image.png", (c) => options.sendPngAsset?.("codia-og.png", c) ?? c.notFound());
  }

  createCodeController(app);

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
