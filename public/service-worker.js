const CACHE = 'soft-arcana-v5-6-no-polish-fog'
const CORE = ["./","./index.html","./manifest.webmanifest","./icon.svg","./cards/hero-pair-0.avif","./cards/hero-pair-1.avif","./cards/hero-pair-2.avif","./cards/hero-pair-3.avif","./cards/hero-pair-4.avif"]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)))
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone()
    caches.open(CACHE).then((cache) => cache.put(event.request, copy))
    return response
  }).catch(() => caches.match('./index.html'))))
})
