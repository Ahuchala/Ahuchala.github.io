import { editedSequences, authoredSequences, favoriteSequences } from '/components/oeis.js'

// ─── Knight data ────────────────────────────────────────────────────────────
const knightNs = Array.from({ length: 37 }, (_, i) => i + 4)
const existingKnights = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,36,38,40]

const knightItems = knightNs.map(n => ({
  label: `n = ${n}`,
  hasImage: existingKnights.includes(n),
  thumbnail: `/images/thumbnails/knight${n}.webp`,
  // knight31 is a large PNG that compresses well to webp; others are tiny and PNG is fine
  full: n === 31 ? `/images/gallery/knight31.webp` : `/images/gallery/knight${n}.png`,
  original: n === 31 ? `/images/gallery/knight31.PNG` : undefined,
  title: `Knight's Domination for n = ${n}`,
  description: `This is a minimal covering of an ${n} × ${n} board by knights.`,
}))

// ─── Barnes-Wall theta data ──────────────────────────────────────────────────
const thetaItems = [
  { file: 'theta_4',   title: '<a href="https://oeis.org/A004011">A004011</a>: n = 4',   description: 'The theta series for the $n = 4$ Barnes-Wall lattice. In this case, this is just the usual $D_4$ lattice, i.e. the set of integer points in $\\mathbb{R}^4$. Also, this is the unique normalized weight 2 modular form for $\\Gamma_0(2)$. This admits the description $$\\Theta_{D_4}(q) = 1 + 24 \\sum_{n>0} \\dfrac{nq^n}{1 + q^n} = 1 + 24q^2 + 24q^4 + 96q^6+\\ldots$$' },
  { file: 'theta_8',   title: '<a href="https://oeis.org/A004009">A004009</a>: n = 8',   description: 'The theta function for the Barnes-Wall lattice in dimension 8 goes by many names. The lattice itself is the root lattice for the Lie algebra $E_8$, and its theta function is the Eisenstein series $E_4$, which along with the Eisenstein series $E_6$, generates the full space of modular forms. It admits a nice description $$E_4(q) = 1 + 240\\sum_{n \\geq 1} \\dfrac{n^3 q^n}{1 - q^n} = 1 + 240q^2 + 2160q^4 + 6720q^6 + \\ldots$$' },
  { file: 'theta_16',  title: '<a href="https://oeis.org/A008409">A008409</a>: n = 16',  description: 'The Barnes-Wall lattice of dimension 16 is typically what one refers to as "the" Barnes-Wall lattice. Its theta series is $$1 + 4320q^2 + 61440q^3 + 522720q^4+\\ldots$$' },
  { file: 'theta_32',  title: '<a href="https://oeis.org/A004670">A004670</a>: n = 32',  description: 'Theta series for the Barnes-Wall lattice of dimension $n = 32$. This is a modular form of weight 16, which may be written as $$E_4^4-960\\Delta E_4 = 1 + 146880q^2 + 64757760q^3 + 4844836800q^4+\\ldots$$ where $E_4$ is the Eisenstein series (with coefficients in A004009) and $\\Delta$ is the cusp form of weight 12.' },
  { file: 'theta_64',  title: '<a href="https://oeis.org/A103936">A103936</a>: n = 64',  description: 'Theta series for the Barnes-Wall lattice of dimension $n = 64$. This is given by $$1 + 9694080q^4 + 89754255360q^6 + 10164979630080q^7+\\ldots$$' },
  { file: 'theta_128', title: '<a href="https://oeis.org/A100004">A100004</a>: n = 128', description: 'Theta series for the Barnes-Wall lattice of dimension $n = 128$. This is given by $$1+1260230400q^4+211691822284800q^6+167823813692620800q^7+\\ldots$$ The noisiness in the image is largely due to the enormous size of the coefficients involved.' },
].map(({ file, title, description }) => {
  // theta_32 compresses slightly larger as webp; all others are meaningfully smaller
  const useWebp = file !== 'theta_32'
  return {
    thumbnail: `/images/thumbnails/${file}.webp`,
    full:      useWebp ? `/images/gallery/${file}.webp` : `/images/gallery/${file}.png`,
    original:  useWebp ? `/images/gallery/${file}.png`  : undefined,
    title, description, hasImage: true,
  }
})

function prefetchImage(href) {
  if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}

export function prefetch() {
  knightItems.filter(i => i.hasImage).forEach(({ thumbnail }) => prefetchImage(thumbnail))
  thetaItems.forEach(({ thumbnail }) => prefetchImage(thumbnail))
}

export function render() {
  return /* html */`
    <section class="intro-alt featured">
      <p class="center-if-needed center-content">
        The Online Encyclopedia of Integer Sequences is an online database of integer-valued
        sequences that anyone can contribute to. It's got a lot of interesting problem
        statements, many with only partial solutions. I've compiled a list of some problems
        I've been interested in, with graphics included if possible.
      </p>
    </section>

    <section class="section collapsible">
      <h2 style="text-align:center">A261752 (Knight&rsquo;s Domination)</h2>
      <p style="text-align:center">&ldquo;Minimum number of knights on an $n\\times n$ chessboard such that every square is attacked.&rdquo;</p>
      <div class="gallery-grid" id="knight-gallery"></div>
      <button class="show-more" id="btn-knight">Show More</button>
    </section>

    <section class="section collapsible">
      <h2 style="text-align:center">A004670 (and friends): Barnes-Wall Lattice Theta Series</h2>
      <p style="text-align:center">Theta series of Barnes-Wall lattices in dimension $n=2^k$. A theta series of a lattice counts the number of points with a given squared distance from the origin. For example, in the typical square grid lattice $\\mathbb{Z}^2$ there is one point of square distance 0, 4 points of square distance 1, 4 points of square distance 2, etc. This is encoded in the function $1+4z+4z^2+4z^4+8z^5+\\ldots$.<br><br>Theta functions have some nice mathematical properties which ultimately arise from the symmetries of the lattices they arise from.<br><br>The Barnes-Wall lattices are a special class of lattices of dimension $2^k$. Since they are even lattices, they never have vectors of odd square length, so I adopt the convention to list their theta functions in powers of $q = z^2$. These plots were generated with Sage.</p>
      <div class="gallery-grid" id="theta-gallery"></div>
      <button class="show-more" id="btn-theta">Show More</button>
    </section>

    <section id="oeis-edits" class="section collapsible">
      <h2>OEIS Sequences I've Worked On Recently</h2>
      <p>Many of these didn't amount to contributions, but I was at least (usually) able to verify the listed terms.</p>
      <div class="oeis-edits oeis-grid" id="grid-edits"></div>
      <button class="show-more" id="btn-edits">Show More</button>
    </section>

    <section id="authored-sequences" class="section collapsible">
      <h2>OEIS Sequences Authored</h2>
      <p>Below is a list of OEIS sequences that I have authored. Click on a sequence to view its entry on the OEIS website.</p>
      <div class="oeis-authored oeis-grid" id="grid-authored"></div>
      <button class="show-more" id="btn-authored">Show More</button>
    </section>

    <section id="other-favorites" class="section">
      <h2>Other OEIS Sequences Near and Dear to My Heart</h2>
      <p style="margin-bottom:8px">These are sequences related to <a href="/files/undergrad/Lie_Algebra_Representation_Thesis.pdf" target="_blank" rel="noreferrer">my undergrad thesis.</a></p>
      <div class="oeis-favorite oeis-grid" id="grid-favorites"></div>
    </section>
  `
}

function populateGallery(containerId, items) {
  const container = document.getElementById(containerId)
  if (!container) return

  const playlist = items.filter(item => item.hasImage)

  items.forEach(item => {
    const wrapper = document.createElement('div')
    wrapper.className = 'gallery-item'

    const label = document.createElement('p')
    label.innerHTML = item.label ?? item.title

    wrapper.appendChild(label)

    if (item.hasImage) {
      const img = document.createElement('img')
      img.src = item.thumbnail
      img.alt = item.label ?? item.title
      img.loading = 'lazy'
      img.decoding = 'async'
      img.style.cursor = 'pointer'
      const playlistIndex = playlist.indexOf(item)
      let preloaded = false
      img.addEventListener('mouseenter', () => {
        if (preloaded) return
        const t = setTimeout(() => { preloaded = true; const p = new Image(); p.fetchPriority = 'low'; p.src = item.full }, 150)
        img.addEventListener('mouseleave', () => clearTimeout(t), { once: true })
      })
      img.addEventListener('click', () =>
        window._openGallery?.(playlist, playlistIndex)
      )
      wrapper.appendChild(img)
    } else {
      const placeholder = document.createElement('div')
      placeholder.className = 'placeholder'
      wrapper.appendChild(placeholder)
    }

    container.appendChild(wrapper)
  })
}

function populateSequences(containerId, sequences) {
  const container = document.getElementById(containerId)
  if (!container) return

  sequences.forEach(seq => {
    const div = document.createElement('div')
    div.className = 'oeis-sequence'

    const idEl = document.createElement('div')
    idEl.className = 'sequence-id'
    idEl.textContent = seq.id

    const nameEl = document.createElement('div')
    nameEl.className = 'sequence-name'
    nameEl.innerHTML = seq.name

    div.appendChild(idEl)
    div.appendChild(nameEl)
    div.addEventListener('click', () => window.open(`https://oeis.org/${seq.id}`, '_blank'))
    container.appendChild(div)
  })
}

function setupCollapsible(gridId, btnId, itemClass, itemMinWidth) {
  const grid = document.getElementById(gridId)
  const btn = document.getElementById(btnId)
  if (!grid || !btn) return

  const items = () => Array.from(grid.querySelectorAll(`.${itemClass}`))

  const applyVisibility = () => {
    const all = items()
    const sectionWidth = grid.clientWidth
    const perRow = Math.max(1, Math.floor(sectionWidth / itemMinWidth))
    const totalRows = Math.ceil(all.length / perRow)

    all.forEach((item, i) => {
      const row = Math.floor(i / perRow)
      if (row === 0 || totalRows <= 2) {
        item.style.display = 'block'
        item.classList.remove('obscured', 'hidden')
      } else if (row === 1) {
        item.style.display = 'block'
        item.classList.add('obscured')
        item.classList.remove('hidden')
      } else {
        item.style.display = 'none'
        item.classList.add('hidden')
        item.classList.remove('obscured')
      }
    })

    btn.style.display = totalRows <= 2 ? 'none' : 'inline-block'
  }

  btn.addEventListener('click', () => {
    if (btn.textContent === 'Show More') {
      items().forEach(item => {
        item.style.display = 'block'
        item.classList.remove('obscured', 'hidden')
      })
      btn.textContent = 'Show Less'
    } else {
      applyVisibility()
      btn.textContent = 'Show More'
    }
  })

  applyVisibility()
  return applyVisibility
}

export function init() {
  populateGallery('knight-gallery', knightItems)
  populateGallery('theta-gallery', thetaItems)
  populateSequences('grid-edits', editedSequences)
  populateSequences('grid-authored', authoredSequences)
  populateSequences('grid-favorites', favoriteSequences)

  const fns = [
    setupCollapsible('knight-gallery', 'btn-knight', 'gallery-item', 150),
    setupCollapsible('theta-gallery',  'btn-theta',  'gallery-item', 150),
    setupCollapsible('grid-edits',     'btn-edits',  'oeis-sequence', 250),
    setupCollapsible('grid-authored',  'btn-authored','oeis-sequence', 250),
  ].filter(Boolean)

  let resizeTimer
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => fns.forEach(fn => fn()), 100)
  }
  window.addEventListener('resize', onResize)
  window._pageCleanup = () => window.removeEventListener('resize', onResize)
}
