const CACHE = 'soft-arcana-v5-9-visible-card-faces'
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
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  // Refresh online so installed copies receive new artwork and application builds.
  event.respondWith(fetch(event.request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE)
      await cache.put(event.request, response.clone())
    }
    return response
  }).catch(async () => {
    const cached = await caches.match(event.request)
    if (cached) return cached
    // Never return HTML for a missing image or script.
    if (event.request.mode === 'navigate') return caches.match('./index.html')
    return Response.error()
  }))
})
