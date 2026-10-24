const CACHE = 'soft-arcana-v7-sharp-major-faces'
const CORE = ["./cards/morute-major-01-v2.webp","./cards/morute-major-02-v2.webp","./cards/morute-major-03-v2.webp","./cards/morute-major-13-v2.webp","./cards/morute-major-18-v2.webp","./cards/morute-mirror-back.webp","./cards/the-fool.png","./cards/morute-major-04.webp","./cards/morute-major-05.webp","./cards/morute-major-06.webp","./cards/morute-major-07.webp","./cards/morute-major-08.webp","./cards/morute-major-09.webp","./cards/morute-major-10.webp","./cards/morute-major-11.webp","./cards/morute-major-12.webp","./cards/morute-major-14.webp","./cards/morute-major-15.webp","./cards/morute-major-16.webp","./cards/morute-major-17.webp","./cards/morute-major-19.webp","./cards/morute-major-20.webp","./cards/morute-major-21.webp","./","./index.html","./manifest.webmanifest","./icon.svg","./cards/hero-pair-0.avif","./cards/hero-pair-1.avif","./cards/hero-pair-2.avif","./cards/hero-pair-3.avif","./cards/hero-pair-4.avif"]

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
