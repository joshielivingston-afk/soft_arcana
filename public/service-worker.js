const CACHE = 'soft-arcana-v4-pass1'
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./cards/major-00.webp", "./cards/major-01.webp", "./cards/major-02.webp", "./cards/major-03.webp", "./cards/major-13.webp", "./cards/major-18.webp", "./cards/cups-01.webp", "./cards/swords-03.webp", "./cards/wands-06.webp", "./cards/pentacles-13.webp"]

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
