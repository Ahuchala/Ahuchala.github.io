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
    a.classList.toggle('active', linkPath === path)
  })
}

function setupModal() {
  const modal = document.getElementById('image-modal')
  if (!modal) return

  const modalImage = document.getElementById('modal-image')
  const modalTitle = document.getElementById('modal-title')
  const modalDescription = document.getElementById('modal-description')
  const prevBtn = modal.querySelector('.modal-prev')
  const nextBtn = modal.querySelector('.modal-next')

  let playlist = null
  let playlistIndex = 0
  let transitioning = false

  function closeModal() {
    modal.style.display = 'none'
    modalImage.src = ''
    modalTitle.innerHTML = ''
    modalDescription.innerHTML = ''
    playlist = null
    if (prevBtn) prevBtn.style.display = 'none'
    if (nextBtn) nextBtn.style.display = 'none'
  }

  function showItem(index, dir) {
    if (!playlist) return
    const item = playlist[index]
    const reduceMotion = document.documentElement.classList.contains('reduce-motion')

    if (!reduceMotion && dir !== 0) {
      const exitCls  = dir > 0 ? 'modal-exit-left'  : 'modal-exit-right'
      const enterCls = dir > 0 ? 'modal-enter-right' : 'modal-enter-left'
      modalImage.classList.add(exitCls)
      setTimeout(() => {
        modalImage.classList.remove(exitCls)
        modalImage.src = item.full
        modalImage.alt = item.title
        modalTitle.innerHTML = item.title
        modalDescription.innerHTML = item.description
        if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription])
        modalImage.classList.add(enterCls)
        modalImage.addEventListener('animationend', () => modalImage.classList.remove(enterCls), { once: true })
        transitioning = false
      }, 200)
    } else {
      modalImage.src = item.full
      modalImage.alt = item.title
      modalTitle.innerHTML = item.title
      modalDescription.innerHTML = item.description
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription])
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

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1) })
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1) })

  const modalContent = modal.querySelector('.modal-content')

  // Single-image modal (research, OEIS, etc.)
  window._openModal = (fullImage, title, description) => {
    playlist = null
    modalContent?.classList.remove('modal-carousel')
    modal.style.display = 'flex'
    modalImage.src = fullImage
    modalImage.alt = title
    modalTitle.innerHTML = title
    modalDescription.innerHTML = description
    if (prevBtn) prevBtn.style.display = 'none'
    if (nextBtn) nextBtn.style.display = 'none'
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription])
  }

  // Gallery carousel modal
  window._openGallery = (items, startIndex) => {
    playlist = items
    playlistIndex = startIndex
    modalContent?.classList.add('modal-carousel')
    modal.style.display = 'flex'
    if (prevBtn) prevBtn.style.display = 'flex'
    if (nextBtn) nextBtn.style.display = 'flex'
    showItem(playlistIndex, 0)
  }

  // Escape / arrow keys — replace handler each time so it closes over current navigate/closeModal
  if (window._modalKeyHandler) {
    document.removeEventListener('keydown', window._modalKeyHandler)
  }
  window._modalKeyHandler = (e) => {
    if (modal.style.display !== 'flex') return
    if (e.key === 'Escape') closeModal()
    if (e.key === 'ArrowLeft')  navigate(-1)
    if (e.key === 'ArrowRight') navigate(1)
  }
  document.addEventListener('keydown', window._modalKeyHandler)
}

export async function navigate(path, pushState = true) {
  path = normalizePath(path)

  const transitionType = getTransitionType(currentPath, path)
  const exitClass   = transitionType > 0 ? 'exiting-left'       : transitionType < 0 ? 'exiting-right'      : 'exiting'
  const enterClass  = transitionType > 0 ? 'entering-from-right' : transitionType < 0 ? 'entering-from-left' : 'entering'

  const loader = routes[path] || routes['/']
  const mod = await loader()

  const app = document.getElementById('app')

  // Run any page cleanup registered by the previous page
  if (window._pageCleanup) {
    window._pageCleanup()
    window._pageCleanup = null
  }

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
    MathJax.typesetPromise([app])
  } else {
    window.addEventListener('mathjax-ready', () => MathJax.typesetPromise([app]), { once: true })
  }

  window.scrollTo(0, 0)
}
