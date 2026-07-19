const CACHE_NAME = "codia-try-it-pwa-v1";

const APP_SHELL = [
  "/try-it",
  "/manifest.webmanifest",
  "/favicon.png",
  "/assets/codia-logo.png",
  "/assets/codia-logo.webp",
  "/assets/vendor/takumi/takumi_wasm_bg.wasm",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap",
  "https://cdn.jsdelivr.net/npm/vanilla-sonner@0.5.2/dist/vanilla-sonner.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@14/swiper-element-bundle.min.js",
];

const RUNTIME_CACHE_ORIGINS = new Set([
  "https://cdn.jsdelivr.net",
  "https://esm.sh",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const putRuntimeResponse = async (request, response) => {
  if (!response || (!response.ok && response.type !== "opaque")) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
};

const networkFirst = async (request, fallbackUrl) => {
  try {
    const response = await fetch(request);
    return putRuntimeResponse(request, response);
  } catch (error) {
    return (await caches.match(request)) ?? caches.match(fallbackUrl);
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  return putRuntimeResponse(request, response);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/try-it"));
    return;
  }

  if (url.origin === self.location.origin || RUNTIME_CACHE_ORIGINS.has(url.origin)) {
    event.respondWith(cacheFirst(request));
  }
});
