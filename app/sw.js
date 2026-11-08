// Service worker: la app funciona sin conexión con los últimos datos descargados.
const VERSION = '__VERSION__';
const SHELL = `gc-shell-${VERSION}`;
const DATA = 'gc-data';
const TILES = 'gc-tiles';
const ARCHIVOS = ['./', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'vendor/leaflet.js', 'vendor/leaflet.css',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('gc-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function recortar(nombre, max) {
  const c = await caches.open(nombre);
  const ks = await c.keys();
  for (let i = 0; i < ks.length - max; i++) await c.delete(ks[i]);
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Datos: red primero, copia guardada si no hay conexión
  if (url.origin === location.origin && url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(e.request).then((r) => {
        if (r.ok) { const cp = r.clone(); caches.open(DATA).then((c) => c.put(e.request, cp)); }
        return r;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }
  // Teselas del mapa: caché primero (máx. 800)
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
        const cp = r.clone();
        caches.open(TILES).then((c) => c.put(e.request, cp)).then(() => recortar(TILES, 800));
        return r;
      }))
    );
    return;
  }
  // App: caché primero, actualizando en segundo plano
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then((hit) => {
        const red = fetch(e.request).then((r) => {
          if (r.ok) { const cp = r.clone(); caches.open(SHELL).then((c) => c.put(e.request, cp)); }
          return r;
        }).catch(() => hit);
        return hit || red;
      })
    );
  }
});
