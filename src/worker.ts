import { createApp } from "./app.js";

type Env = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
};

const app = createApp();
const assetPaths = new Set([
  "/favicon.png",
  "/favicon.ico",
  "/assets/codia-logo.png",
  "/og-image.png",
]);

export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    const url = new URL(request.url);

    if (assetPaths.has(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    return app.fetch(request, env, executionContext);
  },
};
