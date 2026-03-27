const CACHE_VERSION = 'v5'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const IMAGE_CACHE  = `images-${CACHE_VERSION}`

// Shell + all page modules precached on install
const SHELL_URLS = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/scripts/main.js',
  '/scripts/router.js',
  '/components/setComponents.js',
  '/components/header.js',
  '/components/footer.js',
  '/components/gallery.js',
  '/components/oeis.js',
  '/pages/home.js',
  '/pages/gallery.js',
  '/pages/hodge.js',
  '/hodge/scripts.js',
  '/components/hodge/completeIntersection.js',
  '/components/hodge/abelianVariety.js',
  '/components/hodge/grassmannian.js',
  '/components/hodge/flag.js',
  '/components/hodge/twisted.js',
  '/components/hodge/productGrassmannian.js',
  '/components/hodge/chiGrassmannianCI.js',
  '/components/hodge/chiProductCI.js',
  '/components/hodge/abelianVarietyHodgeNumbers.js',
  '/components/hodge/flagHodge.js',
  '/components/hodge/grassmannianHodge.js',
  '/components/hodge/loadMath.js',
  '/components/hodge/twistedHodge.js',
  '/pages/research.js',
  '/pages/teaching.js',
  '/pages/oeis.js',
  '/gallery/styles.css',
  '/hodge/styles.css',
  '/oeis/styles.css',
  '/research/styles.css',
  '/teaching/styles.css',
]

// ─── Install: precache shell ─────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

// ─── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== IMAGE_CACHE)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests from our own origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Navigation → serve SPA shell, UNLESS the URL is a static file path.
  // Chrome includes text/html in Accept for all navigations so we can't
  // use the Accept header to distinguish. Check the URL path instead.
  if (request.mode === 'navigate') {
    if (!url.pathname.startsWith('/images/')) {
      event.respondWith(
        caches.match('/').then(cached => cached || fetch(request))
      )
    }
    // /images/* navigations (e.g. "View full resolution" in new tab) fall
    // through to the browser's default fetch — no respondWith needed.
    return
  }

  // Images → cache-first (images never change once published)
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          }).catch(() => Response.error())
        })
      )
    )
    return
  }

  // Everything else (JS, CSS) → stale-while-revalidate.
  // Serve the cached copy immediately; refresh the cache in the background.
  // Background fetch errors are swallowed — they're non-critical.
  event.respondWith(
    caches.open(STATIC_CACHE).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        if (cached) {
          networkFetch.catch(() => {}) // swallow background revalidation errors
          return cached
        }
        return networkFetch
      })
    )
  )
})
