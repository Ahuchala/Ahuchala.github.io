import { images } from '/components/gallery.js'
import { prefetchImage } from '/scripts/utils.js'

export function prefetch() {
  images.forEach(({ thumbnail }) => prefetchImage(thumbnail))
}

export function render() {
  return /* html */`
    <section class="intro-alt">
      <h2>Gallery</h2>
      <p>A collection of mathematical art.</p>
    </section>

    <div class="gallery" id="gallery-grid"></div>
  `
}

export function init() {
  const gallery = document.getElementById('gallery-grid')
  if (!gallery) return

  images.forEach(({ thumbnail, full, alt, title, description }, index) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'gallery-item'

    const titleEl = document.createElement('p')
    titleEl.className = 'thumbnail-title'
    titleEl.innerHTML = title

    const img = document.createElement('img')
    img.src = thumbnail
    img.alt = alt
    img.loading = 'lazy'
    img.decoding = 'async'
    img.style.cursor = 'pointer'
    let preloaded = false
    img.addEventListener('mouseenter', () => {
      if (preloaded) return
      const t = setTimeout(() => { preloaded = true; const p = new Image(); p.fetchPriority = 'low'; p.src = images[index].full }, 150)
      img.addEventListener('mouseleave', () => clearTimeout(t), { once: true })
    })
    img.addEventListener('click', () => window._openGallery?.(images, index))

    wrapper.appendChild(titleEl)
    wrapper.appendChild(img)
    gallery.appendChild(wrapper)
  })

  // If a specific item was requested (e.g. from the home page museum modal link),
  // open the gallery carousel at that index after the grid is built.
  if (window._pendingGalleryOpen !== undefined) {
    const idx = window._pendingGalleryOpen
    window._pendingGalleryOpen = undefined
    // Defer one frame so the gallery grid is fully in the DOM
    requestAnimationFrame(() => window._openGallery?.(images, idx))
  }
}
