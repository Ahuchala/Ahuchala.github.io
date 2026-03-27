import { images } from '/components/gallery.js'

export function render() {
  return /* html */`
    <div class="center-if-needed">
      <a href="/files/cv/CV.pdf" target="_blank" rel="noreferrer"><h1>Curriculum Vitae</h1></a>
    </div>

    <section class="section">
      <h2>Research</h2>
      <p>
        I'm a math graduate student at the University of Oregon studying algebraic geometry
        under the guidance of Nicolas Addington. My work focuses on computing Hasse-Weil zeta
        functions of smooth hypersurfaces and complete intersections in Grassmannians using
        $p$-adic cohomology.
      </p>

      <section class="publications section">
        <h3>Publications and Preprints</h3>
        <p>
          A preprint of my paper with Fern Gossow on bounded core partitions and the
          Borel-Weil-Bott theorem is available
          <a href="https://arxiv.org/pdf/2510.17239" target="_blank" rel="noreferrer">here</a>.
          An implementation of some results is under construction on my website.
        </p>
        <p>
          I'm currently working on a paper with Arya Yae to construct an explicit Griffiths
          residue map for smooth hypersurfaces in Grassmannians.
        </p>
      </section>

      <div class="section">
        <h2>Zeta Functions</h2>
        <p>
          We recall the definition of the Hasse-Weil zeta function of a projective variety $X$
          over $\\mathbb F_q$:
          $$\\zeta_{X}(t) := \\exp\\left(\\sum_{m\\geq 1}\\#X\\left(\\mathbb F_{q^m}\\right)\\dfrac{t^m}{m}\\right)$$
        </p>
        <p>
          Consider the zeta function of a complete intersection of a cubic and a quadric over
          $\\mathbb P^3$.
          <a href="/hodge">The Hodge diamond calculator on my website</a> uses the adjunction
          formula and Riemann-Roch theorem to calculate that this is a nonhyperelliptic curve of
          genus 4. As an example, let
          $$\\mathcal Z = \\textbf{Proj}\\left( \\mathbb F_{17}[x,y,z,w]\\,/\\,(x^3 + y^3 + z^3 +w^3- xyz ,\\,\\,x^2 + 2y^2 + 3z^2 + 4w^2)\\right)$$
          I wrote a novel
          <a href="https://github.com/Ahuchala/ZetaFunctions/blob/main/complete_intersection_zeta.sage" target="_blank" rel="noreferrer">
            zeta function calculator for smooth complete intersections over $\\mathbb F_p$
          </a>
          extending the
          <a href="https://arxiv.org/pdf/1806.00368" target="_blank" rel="noreferrer">$p$-adic algorithm of Kedlaya et al</a>
          for smooth hypersurfaces. The zeta function of $\\mathcal Z$ is (see also figure below)
          $$\\zeta_\\mathcal Z(t) = \\dfrac{1-4t+3t^2 + 74t^3 - 458t^4 + 1258t^5 + 867t^6 - 19652t^7 + 83521t^8}{(1-t)(1-17t)}$$
          This can be verified via the Weil conjectures and a point counting algorithm because
          $p=17$ is relatively small, but $p$-adic algorithms continue to work for larger primes
          for which point counts become infeasible. I am interested in extending this work to
          complete intersections in Grassmannians.
        </p>

        <section class="gallery" id="research-gallery"></section>
      </div>

      <p>
        My code for zeta function computations is available on
        <a href="https://github.com/Ahuchala/ZetaFunctions" target="_blank" rel="noreferrer">GitHub</a>.
      </p>
    </section>

    <section class="section">
      <h2>Hodge Diamond Calculator</h2>
      <p>
        <a href="/hodge">This applet</a> computes the Hodge diamond of a few classes of
        interesting varieties over $\\mathbb C$, such as smooth complete intersections in
        projective space and Grassmannians, as well as abelian varieties.
      </p>
    </section>

    <section class="section">
      <h2>Past Work</h2>
      <p>
        A few years ago I computed some blowups of toric varieties. Some of the code is available
        <a href="https://github.com/Ahuchala/Toric-Varieties" target="_blank" rel="noreferrer">here</a>.
      </p>
    </section>
  `
}

export function init() {
  const gallery = document.getElementById('research-gallery')
  if (!gallery) return

  const zetaImage = images.find(img => img.title === 'Zeta Function')
  if (!zetaImage) return

  const wrapper = document.createElement('div')
  wrapper.className = 'gallery-item'

  const img = document.createElement('img')
  img.src = zetaImage.thumbnail
  img.alt = zetaImage.alt
  img.style.cursor = 'pointer'
  img.style.maxWidth = '300px'
  img.style.width = '100%'
  let preloaded = false
  img.addEventListener('mouseenter', () => {
    if (preloaded) return
    const t = setTimeout(() => { preloaded = true; const p = new Image(); p.fetchPriority = 'low'; p.src = zetaImage.full }, 150)
    img.addEventListener('mouseleave', () => clearTimeout(t), { once: true })
  })
  img.addEventListener('click', () =>
    window._openModal?.(zetaImage.full, zetaImage.title, zetaImage.description)
  )

  wrapper.appendChild(img)
  gallery.appendChild(wrapper)
}
