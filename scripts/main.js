import { setComponents } from '/components/setComponents.js'
import { initMenuToggle, initSettings } from '/scripts.js'
import { navigate, prefetchRoute } from '/scripts/router.js'

// Handle GitHub Pages redirect (?p=path from 404.html)
const url = new URL(window.location.href)
const redirectPath = url.searchParams.get('p')
if (redirectPath) {
  history.replaceState({}, '', redirectPath)
}

// Set up header and footer
setComponents()
initMenuToggle()
initSettings()

// Prefetch internal links on hover — deferred to idle time so it never competes with active work
const idleCallback = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 100))
document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a[href]')
  if (!link || link.target === '_blank') return
  const href = link.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) return
  const path = new URL(link.href, window.location.origin).pathname
  idleCallback(() => prefetchRoute(path))
})

// Intercept all internal link clicks for SPA navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]')
  if (!link) return
  const href = link.getAttribute('href')
  if (!href) return
  // Skip external links, hash links, mailto, target=_blank
  if (link.target === '_blank') return
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) return
  // Skip file downloads
  if (href.match(/\.(pdf|png|jpg|webp|zip)$/i)) return
  e.preventDefault()
  navigate(new URL(link.href, window.location.origin).pathname)
})

// Browser back / forward
window.addEventListener('popstate', () => {
  navigate(window.location.pathname, false)
})

// Initial page render
navigate(window.location.pathname, false)

// Register service worker for caching on repeat visits
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
