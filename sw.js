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

// Eingehende Push-Benachrichtigung anzeigen
self.addEventListener("push", (e) => {
  let data = { title: "Scoreboard", body: "Es gibt ein Update." };
  try { if(e.data) data = e.data.json(); } catch(err) { /* Fallback bleibt */ }

  e.waitUntil(
    self.registration.showNotification(data.title || "Scoreboard", {
      body: data.body || "",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "scoreboard-overtake",
    })
  );
});

// Klick auf die Benachrichtigung: App öffnen (oder vorhandenes Fenster fokussieren)
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
      if(existing) return existing.focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
