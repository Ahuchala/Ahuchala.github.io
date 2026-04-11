/* ============================
   SHARED UTILITY FUNCTIONS
============================ */

/**
 * Injects a <link rel="prefetch"> tag for an image URL, deduplicating so
 * that the same URL is never inserted twice.
 *
 * @param {string} href - Absolute or root-relative URL of the image.
 */
export function prefetchImage(href) {
  if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}
