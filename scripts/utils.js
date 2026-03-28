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

/**
 * Returns a debounced version of fn that delays invoking it until after
 * `delay` ms have elapsed since the last call. The timer resets on each call,
 * so only the final invocation in a rapid burst actually executes.
 *
 * @param {Function} fn    - The function to debounce.
 * @param {number}   delay - Milliseconds to wait after the last call.
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
