const routes = {
  '/':          () => import('/pages/home.js'),
  '/gallery':   () => import('/pages/gallery.js'),
  '/hodge':     () => import('/pages/hodge.js'),
  '/research':  () => import('/pages/research.js'),
  '/teaching':  () => import('/pages/teaching.js'),
  '/oeis':      () => import('/pages/oeis.js'),
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

  function closeModal() {
    modal.style.display = 'none'
    modalImage.src = ''
    modalTitle.innerHTML = ''
    modalDescription.innerHTML = ''
  }

  // Replace close button to remove old listeners
  const oldClose = modal.querySelector('.close')
  const newClose = oldClose.cloneNode(true)
  oldClose.parentNode.replaceChild(newClose, oldClose)
  newClose.addEventListener('click', closeModal)

  modal.onclick = (e) => { if (e.target === modal) closeModal() }

  // Expose for page modules to call
  window._openModal = (fullImage, title, description) => {
    modal.style.display = 'flex'
    modalImage.src = fullImage
    modalImage.alt = title
    modalTitle.innerHTML = title
    modalDescription.innerHTML = description
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([modalDescription])
  }

  // Escape key — set only once
  if (!window._escModalListenerSet) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeModal()
    })
    window._escModalListenerSet = true
  }
}

export async function navigate(path, pushState = true) {
  path = normalizePath(path)

  const loader = routes[path] || routes['/']
  const mod = await loader()

  const app = document.getElementById('app')

  // Run any page cleanup registered by the previous page
  if (window._pageCleanup) {
    window._pageCleanup()
    window._pageCleanup = null
  }

  // Fade out
  app.style.transition = 'opacity 0.15s ease'
  app.style.opacity = '0'

  await new Promise(r => setTimeout(r, 150))

  app.innerHTML = mod.render()

  if (pushState) {
    history.pushState({ path }, '', path)
  }

  document.title = pageTitles[path] || 'Andy Huchala'
  updateActiveNav(path)
  setupModal()

  // Fade in
  requestAnimationFrame(() => {
    app.style.opacity = '1'
  })

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
