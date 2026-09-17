// Bewusst minimal gehalten: die App braucht ohnehin eine Live-Verbindung zu
// Supabase, "richtiges" Offline-Caching würde hier nur zu veralteten Ständen
// führen. Dieser Service Worker existiert hauptsächlich, damit der Browser
// die Seite als "installierbare App" erkennt (Chrome/Android-Voraussetzung).
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Immer zuerst frisch aus dem Netz laden, damit jedes Update sofort
  // ankommt. Nur wenn gar keine Verbindung besteht, aus dem Cache bedienen.
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
