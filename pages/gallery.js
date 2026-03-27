import { images } from '/components/gallery.js'

function prefetchImage(href) {
  if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}

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
}
