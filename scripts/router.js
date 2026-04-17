function removeMathTabIndex(el) {
  el.querySelectorAll('mjx-container[tabindex]').forEach(m => m.removeAttribute('tabindex'))
}

const routes = {
  '/':          () => import('/pages/home.js'),
  '/gallery':   () => import('/pages/gallery.js'),
  '/hodge':     () => import('/pages/hodge.js'),
  '/research':  () => import('/pages/research.js'),
  '/teaching':  () => import('/pages/teaching.js'),
  '/oeis':      () => import('/pages/oeis.js'),
}

const navOrder = ['/', '/gallery', '/hodge', '/research', '/teaching', '/oeis']
let currentPath = null

function getTransitionType(from, to) {
  const fromIdx = navOrder.indexOf(from)
  const toIdx = navOrder.indexOf(to)
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return 0
  return toIdx > fromIdx ? 1 : -1
}

const pageTitles = {
  '/':          'Andy Huchala',
  '/gallery':   'Gallery | Andy Huchala',
  '/hodge':     'Hodge Diamond Calculator | Andy Huchala',
  '/research':  'Research | Andy Huchala',
  '/teaching':  'Teaching | Andy Huchala',
  '/oeis':      'OEIS | Andy Huchala',
}

function normalizePath(path) {
  if (path === '/index.html' || path === '') return '/'
  // Strip trailing slash unless it's just /
  return path.length > 1 ? path.replace(/\/$/, '') : path
}

function updateActiveNav(path) {
  document.querySelectorAll('.navbar-items a').forEach(a => {
    const linkPath = normalizePath(new URL(a.href, window.location.origin).pathname)
    const isActive = linkPath === path
    a.classList.toggle('active', isActive)
    a.setAttribute('aria-current', isActive ? 'page' : 'false')
  })
}

// ── Idle-time image prefetch for open gallery carousels ──────────────────────
// Tracks the active idle callback and which indices have already been kicked off.
let _idleHandle = null
let _idlePreloaded = new Set()

function cancelIdlePrefetch() {
  if (_idleHandle === null) return
  if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(_idleHandle)
  _idleHandle = null
}

// Prefetches every full image in `items` using browser idle time, spiraling
// outward from `fromIndex`. Adjacent images (+/-1) are already handled by the
// 300 ms setTimeout inside showItem(), so they're seeded into _idlePreloaded
// to avoid duplicate requests.
function startIdlePrefetch(items, fromIndex) {
  cancelIdlePrefetch()
  if (!items || items.length <= 3 || typeof requestIdleCallback === 'undefined') return

  // Mark current + adjacent as already handled so idle fetch skips them.
  ;[-1, 0, 1].forEach(o => {
    _idlePreloaded.add(((fromIndex + o) % items.length + items.length) % items.length)
  })

  // Build a queue spiraling outward: [+2, -2, +3, -3, …]
  const queue = []
  const queued = new Set()
  for (let offset = 2; offset < items.length; offset++) {
    const fwd = (fromIndex + offset) % items.length
    const bwd = ((fromIndex - offset) % items.length + items.length) % items.length
    if (!_idlePreloaded.has(fwd) && !queued.has(fwd)) { queued.add(fwd); queue.push(fwd) }
    if (!_idlePreloaded.has(bwd) && !queued.has(bwd)) { queued.add(bwd); queue.push(bwd) }
  }
  if (queue.length === 0) return

  function prefetchNext(deadline) {
    while ((deadline.timeRemaining() > 8 || deadline.didTimeout) && queue.length > 0) {
      const idx = queue.shift()
      if (!_idlePreloaded.has(idx) && items[idx]?.full) {
        _idlePreloaded.add(idx)
        const p = new Image()
        p.fetchPriority = 'low'
        p.src = items[idx].full
      }
    }
    _idleHandle = queue.length > 0
      ? requestIdleCallback(prefetchNext, { timeout: 8000 })
      : null
  }

  _idleHandle = requestIdleCallback(prefetchNext, { timeout: 8000 })
}

function setupModal() {
  cancelIdlePrefetch() // stop any prior idle prefetch when navigating to a new page

  const modal = document.getElementById('image-modal')
  if (!modal) return

  const modalImage = document.getElementById('modal-image')
  const modalTitle = document.getElementById('modal-title')
  const modalDescription = document.getElementById('modal-description')
  if (!modalImage || !modalTitle || !modalDescription) return

  const prevBtn = modal.querySelector('.modal-prev')
  const nextBtn = modal.querySelector('.modal-next')

  let playlist = null
  let playlistIndex = 0
  let transitioning = false

  let lastFocusedElement = null

  // Scan description HTML for quoted strings that match a gallery title in the
  // current playlist, and wrap them in a <button> that jumps the carousel there.
  // Only activates in carousel mode (playlist !== null).
  function linkifyDescRefs(html) {
    if (!playlist) return html
    const titleMap = new Map(playlist.map((it, i) => [it.title, i]))
    return html.replace(/(?<!=)"([^"<>]+)"/g, (match, inner) => {
      const idx = titleMap.get(inner)
      if (idx === undefined || idx === playlistIndex) return match
      return `<button class="gallery-xref" data-idx="${idx}" aria-label="Jump to ${inner} in gallery">${match}</button>`
    })
  }

  function closeModal() {
    modal.style.display = 'none'
    modalImage.src = ''
    modalTitle.innerHTML = ''
    modalDescription.innerHTML = ''
    playlist = null
    cancelIdlePrefetch()
    if (prevBtn) prevBtn.style.display = 'none'
    if (nextBtn) nextBtn.style.display = 'none'
    // Return focus to the element that triggered the modal
    lastFocusedElement?.focus()
  }

  function showItem(index, dir) {
    if (!playlist) return
    const item = playlist[index]
    const reduceMotion = document.documentElement.classList.contains('reduce-motion')

    const originalLink = item.original
      ? `<p><a href="${item.original}" target="_blank" rel="noopener noreferrer" class="original-link">↗ View full resolution</a></p>`
      : ''

    // Preload adjacent images at low priority after a brief delay
    setTimeout(() => {
      [-1, 1].forEach(offset => {
        const neighbor = playlist[index + offset]
        if (neighbor?.full) {
          const p = new Image()
          p.fetchPriority = 'low'
          p.src = neighbor.full
        }
      })
    }, 300)

    if (!reduceMotion && dir !== 0) {
      const exitCls  = dir > 0 ? 'modal-exit-left'  : 'modal-exit-right'
      const enterCls = dir > 0 ? 'modal-enter-right' : 'modal-enter-left'
      modalImage.classList.add(exitCls)
      setTimeout(() => {
        modalImage.classList.remove(exitCls)
        modalImage.src = item.full
        modalImage.alt = item.title
        modalTitle.innerHTML = item.title
        modalDescription.innerHTML = linkifyDescRefs(item.description + originalLink)
        if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription]).then(() => removeMathTabIndex(modalDescription)).catch(console.error)
        modalImage.classList.add(enterCls)
        modalImage.addEventListener('animationend', () => modalImage.classList.remove(enterCls), { once: true })
        transitioning = false
      }, 200)
    } else {
      modalImage.src = item.full
      modalImage.alt = item.title
      modalTitle.innerHTML = item.title
      modalDescription.innerHTML = linkifyDescRefs(item.description + originalLink)
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription]).then(() => removeMathTabIndex(modalDescription)).catch(console.error)
      transitioning = false
    }
  }

  function navigate(dir) {
    if (!playlist || transitioning) return
    transitioning = true
    playlistIndex = ((playlistIndex + dir) % playlist.length + playlist.length) % playlist.length
    showItem(playlistIndex, dir)
  }

  // Replace close button to remove old listeners
  const oldClose = modal.querySelector('.close')
  const newClose = oldClose.cloneNode(true)
  oldClose.parentNode.replaceChild(newClose, oldClose)
  newClose.addEventListener('click', closeModal)

  modal.onclick = (e) => { if (e.target === modal) closeModal() }

  // Delegated click handler for cross-reference buttons injected by linkifyDescRefs().
  // Remove the old handler first so setupModal() calls don't stack listeners.
  if (modalDescription._xrefHandler) {
    modalDescription.removeEventListener('click', modalDescription._xrefHandler)
  }
  modalDescription._xrefHandler = (e) => {
    const btn = e.target.closest('.gallery-xref')
    if (!btn || !playlist || transitioning) return
    const idx = parseInt(btn.dataset.idx, 10)
    if (isNaN(idx) || idx < 0 || idx >= playlist.length) return
    transitioning = true
    const dir = idx > playlistIndex ? 1 : -1
    playlistIndex = idx
    showItem(playlistIndex, dir)
  }
  modalDescription.addEventListener('click', modalDescription._xrefHandler)

  // Arrow buttons are persistent DOM nodes — remove old listeners before adding new ones
  if (prevBtn) {
    if (prevBtn._clickHandler) prevBtn.removeEventListener('click', prevBtn._clickHandler)
    prevBtn._clickHandler = (e) => { e.stopPropagation(); navigate(-1) }
    prevBtn.addEventListener('click', prevBtn._clickHandler)
  }
  if (nextBtn) {
    if (nextBtn._clickHandler) nextBtn.removeEventListener('click', nextBtn._clickHandler)
    nextBtn._clickHandler = (e) => { e.stopPropagation(); navigate(1) }
    nextBtn.addEventListener('click', nextBtn._clickHandler)
  }

  const modalContent = modal.querySelector('.modal-content')

  // Single-image modal (research, OEIS, etc.)
  window._openModal = (fullImage, title, description) => {
    lastFocusedElement = document.activeElement
    playlist = null
    modalContent?.classList.remove('modal-carousel')
    modal.style.display = 'flex'
    modalImage.src = fullImage
    modalImage.alt = title
    modalTitle.innerHTML = title
    modalDescription.innerHTML = description
    if (prevBtn) prevBtn.style.display = 'none'
    if (nextBtn) nextBtn.style.display = 'none'
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription]).then(() => removeMathTabIndex(modalDescription)).catch(console.error)
    // Move focus into the modal for keyboard/screen-reader users.
    // Focusing the backdrop (not .close) avoids a visible focus ring on open.
    modal.focus()
  }

  // Gallery carousel modal
  window._openGallery = (items, startIndex) => {
    lastFocusedElement = document.activeElement
    playlist = items
    playlistIndex = startIndex
    _idlePreloaded = new Set() // fresh session — clear any prior prefetch tracking
    modalContent?.classList.add('modal-carousel')
    modal.style.display = 'flex'
    if (prevBtn) prevBtn.style.display = 'flex'
    if (nextBtn) nextBtn.style.display = 'flex'
    showItem(playlistIndex, 0)
    startIdlePrefetch(items, startIndex)
    // Move focus into the modal for keyboard/screen-reader users.
    // Focusing the backdrop (not .close) avoids a visible focus ring on open.
    modal.focus()
  }

  // Escape / arrow keys — replace handler each time so it closes over current navigate/closeModal
  if (window._modalKeyHandler) {
    document.removeEventListener('keydown', window._modalKeyHandler)
  }
  window._modalKeyHandler = (e) => {
    if (modal.style.display !== 'flex') return
    if (e.key === 'Escape') { closeModal(); return }
    if (e.key === 'ArrowLeft')  { navigate(-1); return }
    if (e.key === 'ArrowRight') { navigate(1); return }
    if (e.key === 'Tab') {
      // Focus trap: keep keyboard navigation inside the modal while it is open
      const closeBtnEl = modal.querySelector('.close')
      const focusable = [
        ...(prevBtn?.style.display !== 'none' ? [prevBtn] : []),
        closeBtnEl,
        ...Array.from(modalDescription.querySelectorAll('a[href]')),
        ...(nextBtn?.style.display !== 'none' ? [nextBtn] : []),
      ].filter(Boolean)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
  }
  document.addEventListener('keydown', window._modalKeyHandler)
}

// Full transitive dependency list for routes with deep import trees.
// Injecting modulepreload for all of them on hover collapses the waterfall
// so every module starts downloading in parallel instead of in 3 waves.
const routeDeps = {
  '/hodge': [
    '/pages/hodge.js',
    '/hodge/scripts.js',
    '/components/hodge/completeIntersection.js',
    '/components/hodge/abelianVariety.js',
    '/components/hodge/grassmannian.js',
    '/components/hodge/twisted.js',
    '/components/hodge/productGrassmannian.js',
    '/components/hodge/chiGrassmannianCI.js',
    '/components/hodge/chiProductCI.js',
    '/components/hodge/abelianVarietyHodgeNumbers.js',
    '/components/hodge/grassmannianHodge.js',
    '/components/hodge/twistedHodge.js',
    '/components/hodge/hodgeCIWorker.js',
    // flag.js + flagHodge.js + loadMath.js deferred until user clicks Flag Varieties
  ],
}

// Prefetch a route's JS module and any images it declares
const prefetched = new Set()
export function prefetchRoute(path) {
  path = normalizePath(path)
  if (prefetched.has(path)) return
  prefetched.add(path)

  // Inject modulepreload for the full dep tree so all modules download in parallel
  const deps = routeDeps[path]
  if (deps) {
    deps.forEach(href => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const link = document.createElement('link')
      link.rel = 'modulepreload'
      link.href = href
      document.head.appendChild(link)
    })
  }

  const loader = routes[path]
  if (loader) loader().then(mod => mod.prefetch?.()).catch(console.error)
}

export async function navigate(path, pushState = true) {
  path = normalizePath(path)

  const transitionType = getTransitionType(currentPath, path)
  const exitClass   = transitionType > 0 ? 'exiting-left'       : transitionType < 0 ? 'exiting-right'      : 'exiting'
  const enterClass  = transitionType > 0 ? 'entering-from-right' : transitionType < 0 ? 'entering-from-left' : 'entering'

  const loader = routes[path] || routes['/']
  let mod
  try {
    mod = await loader()
  } catch (err) {
    console.error('Failed to load page:', err)
    const app = document.getElementById('app')
    if (app) {
      app.style.opacity = ''
      app.innerHTML = `<section class="section"><p class="error">Failed to load this page. Please refresh and try again.</p></section>`
    }
    return
  }

  const app = document.getElementById('app')

  // Run any page cleanup registered by the previous page
  if (window._pageCleanup) {
    window._pageCleanup()
    window._pageCleanup = null
  }

  // Close any open modal before the content swap — modals live in index.html
  // outside #app so they persist across SPA navigations unless explicitly closed.
  const modal = document.getElementById('image-modal')
  if (modal) modal.style.display = 'none'

  const reduceMotion = document.documentElement.classList.contains('reduce-motion')

  // Exit animation (skip on initial load or when reduce motion is enabled)
  if (currentPath !== null && !reduceMotion) {
    app.classList.add(exitClass)
    await new Promise(r => setTimeout(r, 160))
    app.classList.remove(exitClass)
  }

  // Hold opacity at 0 during content swap to prevent flash
  app.style.opacity = '0'
  app.innerHTML = mod.render()
  app.style.opacity = ''
  currentPath = path

  if (pushState) {
    history.pushState({ path }, '', path)
  }

  document.title = pageTitles[path] || 'Andy Huchala'
  updateActiveNav(path)
  setupModal()

  // Enter animation (skip when reduce motion is enabled)
  if (!reduceMotion) {
    app.classList.add(enterClass)
    app.addEventListener('animationend', () => app.classList.remove(enterClass), { once: true })
  }

  // Run page-specific init (dynamic content, event listeners)
  if (mod.init) mod.init()

  // Re-typeset MathJax
  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([app]).then(() => removeMathTabIndex(app)).catch(console.error)
  } else {
    window.addEventListener('mathjax-ready', () => MathJax.typesetPromise([app]).then(() => removeMathTabIndex(app)).catch(console.error), { once: true })
  }

  window.scrollTo(0, 0)
}
