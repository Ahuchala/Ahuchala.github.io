import { init as initCI } from '/components/hodge/completeIntersection.js'
import { init as initAbelian } from '/components/hodge/abelianVariety.js'
import { init as initGrassmannian } from '/components/hodge/grassmannian.js'
import { init as initTwisted } from '/components/hodge/twisted.js'
import { init as initProduct } from '/components/hodge/productGrassmannian.js'
import { init as initHodgeScripts } from '/hodge/scripts.js'

export function render() {
  return `<!-- Current Work -->
        

        <!-- Hodge Diamond Calculators -->
        <section class="section">
            <h2>Hodge Diamond Calculator</h2>
            <p>
                This applet computes the Hodge diamond of a few classes of interesting varieties over $\\mathbb C$, such as smooth complete intersections in projective space and Grassmannians, as well as abelian varieties.
            </p>
            <!-- Toggle Menu -->
            <div id="toggle-menu">
                <button id="toggle-complete-intersection" class="toggle-button pressed">Complete Intersections in $\\mathbb P^n$</button>
                <button id="toggle-abelian-variety" class="toggle-button">Abelian Varieties</button>
                <button id="toggle-grassmannian" class="toggle-button">Complete Intersections in $\\text{Gr}(k,n)$</button>
                <button id="toggle-flag" class="toggle-button">Flag Varieties</button>
                <button id="toggle-twisted" class="toggle-button">Twisted Hodge Numbers</button>
                <button id="toggle-product-grassmannian" class="toggle-button">CIs in Products of Grassmannians</button>
            </div>
        
            <!-- Calculator Containers -->
            <div id="complete-intersection-container" class="calculator-container">
                <section class="section">
                    <h2>Preset Examples</h2>
                    <div id="preset-buttons">
                        <button class="preset-button" data-n="2" data-r="1" data-degrees="3">
                            Elliptic Curve (Cubic in $\\mathbb{P}^2$)
                        </button>
                        <button class="preset-button" data-n="3" data-r="2" data-degrees="2,2">
                            Elliptic Curve (Two Quadrics in $\\mathbb{P}^3$)
                        </button>
                        <button class="preset-button" data-n="3" data-r="1" data-degrees="4">
                            K3 Surface (Quartic in $\\mathbb{P}^3$)
                        </button>
                        <button class="preset-button" data-n="4" data-r="2" data-degrees="3,2">
                            K3 Surface (Cubic and Quadric in $\\mathbb{P}^4$)
                        </button>
                        <button class="preset-button" data-n="5" data-r="3" data-degrees="2,2,2">
                            K3 Surface (Three Quadrics in $\\mathbb{P}^5$)
                        </button>
                        <button class="preset-button" data-n="5" data-r="1" data-degrees="3">
                            Cubic Fourfold (Cubic in $\\mathbb{P}^5$)
                        </button>
                    </div>
                </section>
                <div id="hodge-container">
                    <div id="inputs">
                        <h3>Complete Intersection Calculator</h3>
                        <div class="input-row">
                          <label for="n-slider">Dimension of Projective Space (\\(n\\)):</label>
                          <input type="range" id="n-slider" min="1" max="10" value="4">
                          <input type="number" id="n-value" min="1" max="50" value="4" class="hodge-input">
                        </div>
                        <div class="input-row">
                          <label for="r-slider">Number of Hypersurfaces (\\(r\\)):</label>
                          <input type="range" id="r-slider" min="0" max="10" value="2">
                          <input type="number" id="r-value" min="0" value="2" class="hodge-input">
                        </div>
                        <div class="input-row">
                          <div id="degree-toggles"></div>
                        </div>
                      </div>
                    <div id="diamond-box">
                        <div class="hodge-diamond-description"></div>
                        <div class="diamond-scroll-wrapper">
                            <div id="diamond-container">
                                <p class="placeholder">The Hodge diamond will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
            <div id="abelian-variety-container" class="calculator-container" style="display: none;">
                <section class="section">
                    <h2>Preset Examples</h2>
                    <div id="preset-buttons-abelian">
                        <button class="preset-button" data-g="1">
                            Elliptic Curve (\\( g = 1 \\))
                        </button>
                        <button class="preset-button" data-g="2">
                            Abelian Surface ($g=2$)
                        </button>
                    </div>
                </section>
                <div id="hodge-container">
                    <div id="inputs">
                        <h3>Abelian Variety Calculator</h3>
                        <div class="input-row">
                            <label for="g-slider">Genus ($g$):</label>
                            <input type="range" id="g-slider" min="1" max="10" value="2">
                            <input type="number" id="g-value" min="1" max="50" value="2" class="hodge-input">
                        </div>
                    </div>
                    <div id="diamond-box">
                        <div class="hodge-diamond-description"></div>
                        <div class="diamond-scroll-wrapper">
                            <div id="diamond-container-abelian">
                                <p class="placeholder">The Hodge diamond will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="grassmannian-container" class="calculator-container" style="display: none;">
                <section class="section">
                    <h2>Preset Examples</h2>
                    <div id="preset-buttons-grassmannian">
                        <button class="preset-button" data-k="2" data-n="7" data-r="7" data-degrees="1,1,1,1,1,1,1">
                            Calabi–Yau Threefold (7 hyperplanes in $\\text{Gr}(2,7)$)
                        </button>
                        <button class="preset-button" data-k="3" data-n="10" data-r="1" data-degrees="1">
                            Debarre–Voisin 20-fold (hyperplane in $\\text{Gr}(3,10)$)
                        </button>
                        <button class="preset-button" data-k="2" data-n="5" data-r="2" data-degrees="2,1">
                            Gushel–Mukai Fourfold (quadric and hyperplane in $\\text{Gr}(2,5)$)
                        </button>
                        <button class="preset-button" data-k="2" data-n="5" data-r="1" data-degrees="2">
                            Gushel–Mukai Fivefold (quadric in $\\text{Gr}(2,5)$)
                        </button>
                    </div>
                </section>
                <div id="hodge-container">
                    <div id="inputs">
                        <h3>Grassmannian Calculator</h3>
                        <div class="input-row">
                            <label for="n-slider-grassmannian">Dimension of Ambient Space (\\(n\\)):</label>
                            <input type="range" id="n-slider-grassmannian" min="1" max="10" value="4">
                            <input type="number" id="n-value-grassmannian" min="1" max="50" value="4" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <label for="k-slider-grassmannian">Dimension of Subspace (\\(k\\)):</label>
                            <input type="range" id="k-slider-grassmannian" min="1" max="10" value="2">
                            <input type="number" id="k-value-grassmannian" min="1" max="50" value="2" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <label for="r-slider-grassmannian">Number of Hypersurfaces (\\(r\\)):</label>
                            <input type="range" id="r-slider-grassmannian" min="0" max="10" value="2">
                            <input type="number" id="r-value-grassmannian" min="0" max="50" value="2" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <div id="degree-toggles-grassmannian"></div>
                        </div>
                    </div>
                    <div id="diamond-box">
                        <div class="hodge-diamond-description"></div>
                        <div class="diamond-scroll-wrapper">
                            <div id="diamond-container-grassmannian">
                                <p class="placeholder">The Hodge diamond will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Flag Calculator Container -->
            <div id="flag-container" class="calculator-container" style="display: none;">
                <div id="hodge-container">
                  <div id="inputs">
                    <h3 id="flag-title">Flag Variety Calculator</h3>
                    <div class="input-row">
                      <label for="dims-input">List of Dimensions (e.g. 1,1,1,1):</label>
                      <input type="text" id="dims-input" value="1,1,1,1" class="hodge-input">
                    </div>
                    <div class="input-row">
                      <label for="r-slider-flag">Number of Hypersurfaces (r):</label>
                      <input type="range" id="r-slider-flag" min="0" max="10" value="1">
                      <input type="number" id="r-value-flag" min="0" value="1" class="hodge-input">
                    </div>
                    <div class="input-row">
                      <div id="degree-toggles-flag"></div>
                    </div>
                  </div>
                  <div id="diamond-box">
                    <div class="hodge-diamond-description" id="flag-description"></div>
                    <div class="diamond-scroll-wrapper">
                        <div id="diamond-container-flag">
                          <p class="placeholder">The Hodge diamond will be displayed here.</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            
              <!-- Twisted Hodge Number Container -->
              <div id="twisted-container" class="calculator-container" style="display: none;">
                <div id="hodge-container">
                    <div id="inputs">
                        <h3>Twisted Hodge Number Calculator</h3>
                        <div class="input-row">
                            <label for="n-slider-grassmannian">Dimension of Ambient Space (\\(n\\)):</label>
                            <input type="range" id="n-slider-twisted" min="1" max="10" value="4">
                            <input type="number" id="n-value-twisted" min="1" max="50" value="4" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <label for="k-slider-grassmannian">Dimension of Subspace (\\(k\\)):</label>
                            <input type="range" id="k-slider-twisted" min="1" max="10" value="2">
                            <input type="number" id="k-value-twisted" min="1" max="50" value="2" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <label for="t-slider-twisted">Degree of twist (\\(t\\)):</label>
                            <input type="range" id="t-slider-twisted" min="-10" max="10" value="2">
                            <input type="number" id="t-value-twisted" min="-50" max="50" value="2" class="hodge-input">
                        </div>
                    </div>
                    <div id="diamond-box">
                        <div class="hodge-diamond-description"></div>
                        <div class="diamond-scroll-wrapper">
                            <div id="diamond-container-twisted">
                                <p class="placeholder">The Hodge diamond will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product of Grassmannians CI Container -->
            <div id="product-grassmannian-container" class="calculator-container" style="display: none;">
                <section class="section">
                    <h2>Preset Examples</h2>
                    <div id="preset-buttons-product">
                        <button class="preset-button"
                            data-factors="1,2,1,2" data-r="0" data-degrees="">
                            $\\mathbb{P}^1 \\times \\mathbb{P}^1$
                        </button>
                        <button class="preset-button"
                            data-factors="1,2,1,2" data-r="1" data-degrees="2,2">
                            Elliptic Curve (bidegree $(2,2)$ in $\\mathbb{P}^1\\times\\mathbb{P}^1$)
                        </button>
                        <button class="preset-button"
                            data-factors="1,2,1,3" data-r="1" data-degrees="2,3">
                            K3 Surface (bidegree $(2,3)$ in $\\mathbb{P}^1\\times\\mathbb{P}^2$)
                        </button>
                        <button class="preset-button"
                            data-factors="1,3,1,3" data-r="1" data-degrees="3,3">
                            Calabi&ndash;Yau Threefold (bidegree $(3,3)$ in $\\mathbb{P}^2\\times\\mathbb{P}^2$)
                        </button>
                        <button class="preset-button"
                            data-factors="1,2,1,2,1,2" data-r="1" data-degrees="2,2,2">
                            K3 Surface (tridegree $(2,2,2)$ in $\\mathbb{P}^1\\times\\mathbb{P}^1\\times\\mathbb{P}^1$)
                        </button>
                        <button class="preset-button"
                            data-factors="1,2,1,2,1,2,1,2" data-r="2" data-degrees="1,1,1,1,1,1,1,1">
                            K3 Surface (multidegrees $(1,1,1,1)^2$ in $\\mathbb{P}^1\\times\\mathbb{P}^1\\times\\mathbb{P}^1\\times\\mathbb{P}^1$)
                        </button>
                    </div>
                </section>
                <div id="hodge-container">
                    <div id="inputs">
                        <h3>Product Grassmannian CI Calculator</h3>
                        <div id="factor-inputs-product">
                            <!-- Factor rows are created dynamically by productGrassmannian.js -->
                        </div>
                        <div class="input-row">
                            <button id="add-factor-product" class="preset-button" type="button">+ Add Factor</button>
                            <button id="remove-factor-product" class="preset-button" type="button" disabled>&#8722; Remove Factor</button>
                        </div>
                        <div class="input-row">
                            <label for="r-slider-product">Number of Hypersurfaces (\\(r\\)):</label>
                            <input type="range" id="r-slider-product" min="0" max="10" value="0">
                            <input type="number" id="r-value-product" min="0" max="50" value="0" class="hodge-input">
                        </div>
                        <div class="input-row">
                            <div id="degree-toggles-product"></div>
                        </div>
                    </div>
                    <div id="diamond-box">
                        <div class="hodge-diamond-description"></div>
                        <div class="diamond-scroll-wrapper">
                            <div id="diamond-container-product">
                                <p class="placeholder">The Hodge diamond will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
        <div class="input-row" style="margin-top:.5rem">
        <label>
            <input type="checkbox" id="zero-color-toggle">
            Alternate color for zero entries
        </label>
        </div>
        <div class="input-row" style="margin-top:.25rem">
          <label>
            <input type="checkbox" id="hide-top-half-toggle">
            Hide upper half of Hodge diamond
          </label>
        </div>


        <div class="how-does-it-work-div">
            <section class="section">
                <h2>How does it work?</h2>
                <p>
                    The Hodge numbers of complete intersections in Grassmannians works using the Hirzebruch-Riemann-Roch theorem, adjunction formula, and Lefschetz hyperplane theorem, along with Hodge symmetry and Serre duality. Under the hood, a lot of this is computed in Macaulay2 using Schubert calculus. 

                </p>
                <p>
                    Abelian varieties are a lot easier (over $\\mathbb C$) since topologically they are tori so the K&uuml;nneth theorem applies.

                </p>
                <div>
                    <h3>Smooth Hypersurfaces and Complete Intersections in $\\mathbb P^n$</h3>
                    <p>
                        <a href="https://hirzebruch.mpim-bonn.mpg.de/id/eprint/91/1/12_Satz%20von%20Riemann-Roch%20in%20faisceau-theoretischer%20Formulierung.pdf">In 1957 Hirzebruch found a generating function</a> for the the Hodge numbers of a smooth complete intersection in $\\mathbb P^n$ using Chern-Weil theory. He proved that when $X$ is a complete intersection of multidegree $(a_1,\\ldots,a_r)$ in $\\mathbb P^n$, 
                        $$\\sum_{p,q}(-1)^q h_{\\text{prim}}^{p,q}(X)x^py^q
                        =\\dfrac{1}{(1+x)(1+y)}\\left(\\prod_{i=1}^r\\dfrac{(1+x)^{a_i}-(1+y)^{a_i}}{-(1+x)^{a_i}y+(1+y)^{a_i}x}-1\\right).
                        $$
                    </p>
                    <p>
                        You can find a nice implementation of this generating function approach on <a href="https://pbelmans.ncag.info/cohomology-tables/">Pieter Belman's website</a> (which also allows for some twists!). My website also uses this generating function for complete intersections in $\\mathbb P^n$.
                    </p>
                </div>
                <div>
                    <h3>Smooth Hypersurfaces and Complete Intersections in $\\text{Gr}(k,n)$</h3>
                    <p>
                        There is no known generating function such as the one from Hirzebruch in the case of $\\text{Gr}(k,n)$. However, we can use the Hirzebruch-Riemann-Roch theorem to determine the euler characteristic of $\\Omega^j(X)$, which in turn allows us to compute the Hodge numbers.
                    </p>
                    <p>
                        Recall that for a holomorphic vector bundle $ E$ on $X$ we define the euler characteristic by
                        $$\\chi(X,E) = \\sum_{i} (-1)^i\\dim H^i(X,E)
                            $$
                        The Hirzebruch-Riemann-Roch theorem states that
                        $$\\chi(X,E) = \\int_X \\text{ch}(E)\\wedge \\text{td}(T_X)
                        $$
                        where $\\text{ch}(E)$ denotes the Chern character of $E$ and $\\text{td}(T_X)$ denotes the Todd class of the tangent bundle of $X$. These are each computed symbolically in Macualay2 using the Schubert2 package. It turns out that computing $\\chi(X,\\Omega^j)$ provides enough information to deduce the Hodge numbers of $X$, by the Lefschetz hyperplane theorem: Let $X\\subset Y$ be an inclusion of nice enough spaces. Then
                        $$H^i(X)\\cong H^i(Y)\\text{ for all }i<\\text{dim}\\,X-1
                        $$
                        and
                        $$H^i(X)\\to H^i(Y)\\text{ is an injection for  }i=\\text{dim}\\,X-1.
                        $$
                        This, combined with Serre duality and the adjunction formula, is sufficient to compute the Hodge numbers of a complete intersection in $\\text{Gr}(k,n)$.

                    </p>
                </div>
                <div>
                    <h3>Line bundles on $\\text{Gr}(k,n)$</h3>
                    One can use the Borel-Weil-Bott theorem to deduce the Hodge numbers of line bundles on $\\text{Gr}(k,n)$. <a href="https://arxiv.org/pdf/2510.17239">The paper I wrote with Fern Gossow</a> allows for efficient computations.
                    
                    This section is under construction.
                </div>
            </section>
        </div>`
}

export function init() {
  initCI()
  initAbelian()
  initGrassmannian()
  initTwisted()
  initProduct()
  initHodgeScripts()

  // Flag variety calculator is deferred — preload modules on hover, init on first click
  const flagBtn = document.getElementById('toggle-flag')
  if (flagBtn) {
    const flagDeps = [
      '/components/hodge/flag.js',
      '/components/hodge/flagHodge.js',
      '/components/hodge/loadMath.js',
    ]
    flagBtn.addEventListener('mouseover', () => {
      flagDeps.forEach(href => {
        if (document.querySelector(`link[href="${href}"]`)) return
        const link = document.createElement('link')
        link.rel = 'modulepreload'
        link.href = href
        document.head.appendChild(link)
      })
    }, { once: true })

    flagBtn.addEventListener('click', async () => {
      const { init: initFlag } = await import('/components/hodge/flag.js')
      initFlag()
    }, { once: true })
  }
}
