const CACHE_VERSION = 'v7'
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
  '/components/hodge/hodgeCIWorker.js',
  '/scripts/utils.js',
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
    if (!url.pathname.startsWith('/images/') && !url.pathname.startsWith('/files/')) {
      event.respondWith(
        caches.match('/').then(cached => cached || fetch(request))
      )
    }
    // /images/* and /files/* navigations fall through to the browser's default fetch.
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
  //
  // fetch() failures are handled at the point of creation (.catch → null) so
  // the rejection never becomes "naked" — attaching .catch() to a derived
  // promise after the fact is not always sufficient to suppress Chrome's
  // "Uncaught (in promise)" warning when the fetch fails synchronously before
  // the derived-promise handler has been attached.
  event.respondWith(
    caches.open(STATIC_CACHE).then(cache =>
      cache.match(request).then(cached => {
        // Inline catch on fetch so the promise always resolves (Response | null).
        const networkFetch = fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => null)

        if (cached) return cached // background revalidation runs silently

        // No cached copy. For bare SPA-route paths (no file extension), fall
        // back to the shell so speculative / prefetch requests for routes like
        // /teaching or /gallery get a valid response.
        const hasExtension = /\.\w+(\?.*)?$/.test(url.pathname)
        if (!hasExtension) {
          return caches.match('/').then(shell =>
            shell || networkFetch.then(r => r ?? Response.error())
          )
        }
        return networkFetch.then(r => r ?? Response.error())
      })
    )
  )
})
