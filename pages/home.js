export function render() {
  return /* html */`
    <section class="intro">
      <div class="intro-content">
        <h2>Welcome!</h2>
        <p>A space for my work in research, teaching, and art.</p>
      </div>
    </section>

    <section id="gallery" class="featured section">
      <h3 class="center-content">Featured Work</h3>
      <p class="center-if-needed center-content">
        <span>
          <em>The Sand Reckoner:</em> An abelian sandpile is the result of stacking a bunch of boxes
          in a rectangular grid, and whenever you have at least 4 tall, you "topple" the pile by
          moving one box to each of its four neighbors. This image is the result of stacking several
          million boxes in the center of a 9,000 &times; 9,000 grid, letting them topple for a while,
          and then coloring the result by height.
        </span>
      </p>
      <div class="featured-item">
        <img
          src="/images/thumbnails/museum_small.webp"
          alt="Museum Submission"
          class="center-content"
          style="cursor:pointer"
          id="featured-img"
        />
        <p class="center-content">
          <em>Displayed in the Jordan Schnitzer Museum of Art in 2021 (and currently on display in the Eugene Airport!).</em>
        </p>
      </div>
    </section>

    <section class="grid-section">
      <h2>Explore More</h2>
      <div class="grid-container">
        <div class="grid-item">
          <a href="/gallery">
            <img src="/images/thumbnails/cracked.webp" alt="Gallery">
            <p>Gallery</p>
          </a>
        </div>
        <div class="grid-item">
          <a href="/hodge">
            <img src="/images/thumbnails/theta_8.webp" alt="Hodge Diamonds">
            <p>Hodge Diamonds</p>
          </a>
        </div>
        <div class="grid-item">
          <a href="/research">
            <img src="/images/thumbnails/zetafunction.webp" alt="Research">
            <p>Research</p>
          </a>
        </div>
        <div class="grid-item">
          <a href="/teaching">
            <img src="/images/thumbnails/broken.webp" alt="Teaching">
            <p>Teaching</p>
          </a>
        </div>
        <div class="grid-item">
          <a href="/oeis">
            <img src="/images/thumbnails/knight31.webp" alt="OEIS">
            <p>OEIS</p>
          </a>
        </div>
      </div>
    </section>
  `
}

export function init() {
  const featuredImg = document.getElementById('featured-img')
  if (featuredImg) {
    let preloaded = false
    featuredImg.addEventListener('mouseenter', () => {
      if (preloaded) return
      const t = setTimeout(() => { preloaded = true; const p = new Image(); p.fetchPriority = 'low'; p.src = '/images/gallery/museum_small.webp' }, 150)
      featuredImg.addEventListener('mouseleave', () => clearTimeout(t), { once: true })
    })
    featuredImg.addEventListener('click', () => {
      window._openModal?.(
        '/images/gallery/museum_small.webp',
        'Museum Submission',
        `A $9000\\times 9000$ abelian sandpile with millions of grains. This, along with a zoomed in version, was originally submitted to the Jordan Schnitzer Museum of Art in 2020 and was displayed in their virtual gallery until the museum was able to resume in-person operation in 2021. Also currently on display in gate A of the Eugene airport. It was also published in Girls' Angle magazine, a magazine aimed to increase engagement of girls in math. <a href='/gallery'>A slightly more mathematical description of the construction of abelian sandpiles is given in the gallery</a>.<br><br>Original Caption: <i>This piece attempts to capture the spirit of the infinite and print it on a single page. It uses what's called an Abelian Sandpile model, which is a fractal that colors "grains of sand" by their slope. A fractal is a kind of mathematical picture with a repeated motif no matter how far in or out you zoom. The Abelian Sandpile model achieves this by stacking a large number of grains of sand in the center of a grid, and then "topples" it onto the adjacent 4 tiles. The taller the pile of sand at the start, the more times you can topple, and the closer to the illusion of infinity you get. Adding color depicting the different heights of sand helps us visualize the resulting fractal structure.</i>`
      )
    })
  }
}
