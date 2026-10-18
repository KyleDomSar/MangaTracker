const CACHE_NAME = "mangatracker-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add("/"))
  );
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses; never serve a cached 404/500.
        if (response.ok) {
          const copy = response.clone();
          // Tie the write to the event lifetime so the worker cannot be
          // terminated before the cache put completes.
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Offline fallback: only navigations get the cached shell. Asset
        // requests must fail cleanly instead of receiving HTML back.
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
