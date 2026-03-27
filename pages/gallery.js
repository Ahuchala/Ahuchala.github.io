import { images } from '/components/gallery.js'

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

  images.forEach(({ thumbnail, full, alt, title, description }) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'gallery-item'

    const titleEl = document.createElement('p')
    titleEl.className = 'thumbnail-title'
    titleEl.innerHTML = title

    const img = document.createElement('img')
    img.src = thumbnail
    img.alt = alt
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => window._openModal?.(full, title, description))

    wrapper.appendChild(titleEl)
    wrapper.appendChild(img)
    gallery.appendChild(wrapper)
  })
}
