// RummyTally service worker: lets the installed app open without a connection.
// Always tries the network first, so updates show straight away; the saved copy is only used offline.
const CACHE = 'rummytally-v3';
const LIB = 'rummytally-lib-v1';   // Firebase library files: their address includes the version, so they never change
const CORE = ['/', '/index.html', '/js/firebase-config.js', '/assets/manifest.webmanifest', '/assets/icons/favicon.svg', '/assets/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== LIB).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Firebase library: kept after the first visit so online rooms also start without a connection
  if (req.method === 'GET' && url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.open(LIB).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // database, ads etc. go straight to the network
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/index.html') : undefined)))
  );
});
