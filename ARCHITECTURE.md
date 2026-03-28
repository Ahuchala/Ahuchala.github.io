# Architecture

## Overview

The site is a zero-build SPA — no webpack, no Vite, no compilation step. Raw ES modules
are served directly to the browser. There are no npm dependencies for production.

**Pages:** Home, Gallery, Hodge Diamond Calculator, Research, Teaching, OEIS

**Hosting:** GitHub Pages. `404.html` handles SPA routing by encoding the path as a
query parameter (`?p=`) and redirecting to `index.html`, which decodes it on boot.

---

## Project structure

```
.
├── index.html              # App shell — single HTML file for the whole SPA
├── styles.css              # Global CSS (variables, typography, layout, animations)
├── sw.js                   # Service worker (offline caching)
├── scripts/
│   ├── main.js             # Entry point
│   └── router.js           # SPA router, prefetching, modal system
├── pages/                  # One module per page (render + init)
├── components/
│   ├── header.js           # Nav bar with dark/reduce-motion toggles
│   ├── footer.js
│   ├── gallery.js          # Gallery image data
│   ├── oeis.js             # OEIS sequence data
│   └── hodge/              # Hodge calculator logic
├── hodge/
│   ├── styles.css          # Hodge-specific styles
│   └── scripts.js          # Cross-cutting Hodge init (toggles, labels, description)
├── {gallery,research,teaching,oeis}/styles.css
├── images/                 # Gallery images and thumbnails
├── files/                  # CV and downloadable documents
├── misc/                   # Precomputed JSON data for flag varieties
├── tests/
│   └── hodge.test.js       # Node.js test suite for all 6 calculators
└── 404.html                # GitHub Pages SPA redirect
```

### Hodge components

```
components/hodge/
├── completeIntersection.js     # Calculator 1: CI in ℙⁿ
├── abelianVariety.js           # Calculator 2: abelian varieties
├── grassmannian.js             # Calculator 3: CI in Gr(k,n)
├── flag.js                     # Calculator 4: flag varieties (deferred load)
├── twisted.js                  # Calculator 5: twisted Hodge numbers
├── productGrassmannian.js      # Calculator 6: CI in products of Gr
│
├── chiGrassmannianCI.js        # Core math: Schubert calculus + Koszul recurrence
├── grassmannianHodge.js        # Hodge numbers for Gr(k,n) itself
├── abelianVarietyHodgeNumbers.js
├── twistedHodge.js
├── chiProductCI.js
├── flagHodge.js                # Deferred with flag.js
├── loadMath.js                 # Shared math utilities (deferred)
└── flag-hodge/dims*.json       # Precomputed diamonds for specific flag types
```

---

## Boot sequence

```
index.html
  └─ <script type="module" src="/scripts/main.js">
       ├─ setComponents()        — injects <header> and <footer>
       ├─ initMenuToggle()       — mobile hamburger menu
       ├─ initSettings()         — dark mode / reduce-motion toggles
       ├─ hover listener         — prefetchRoute() on internal <a> hover
       ├─ click listener         — intercepts internal links → navigate()
       ├─ popstate listener      — browser back/forward → navigate()
       ├─ navigate(pathname)     — initial render of the current URL
       └─ serviceWorker.register('/sw.js')
```

Everything after `main.js` is lazy-loaded per page via dynamic `import()`.

---

## SPA routing (`scripts/router.js`)

### `navigate(path, pushState = true)`

Every page transition goes through here:

1. Derive transition direction (left/right/none) by comparing old and new route index.
2. `import()` the page module (cached by the browser after first load).
3. Call `window._pageCleanup()` if the outgoing page registered one.
4. Animate `#app` out (CSS class → 160 ms → remove class).
5. Set `app.innerHTML = mod.render()` with opacity briefly 0 to suppress flash.
6. Push to `history`, update `<title>`, update active nav link.
7. Animate `#app` in.
8. Call `mod.init()` for event-listener setup.
9. Re-run `MathJax.typesetPromise([app])`.
10. Scroll to top.

### `prefetchRoute(path)`

Injects `<link rel="modulepreload">` for the full transitive dependency tree of a route.
Without this, deep import chains (the Hodge page has 10+ modules) load in sequential
waterfall waves. Each route is prefetched at most once, guarded by a `Set`.

### `window._pageCleanup`

A page can set this to a teardown function. The router calls and nulls it before each
navigation. Currently only the Hodge page uses it (to remove `body.hodge-active`).

### Modal system

`setupModal()` re-runs after every navigation and exposes two globals:
- `window._openModal(src, title, desc)` — single-image modal (Research, OEIS)
- `window._openGallery(items, startIndex)` — carousel modal (Gallery)

Both share the `#image-modal` node in `index.html`. The close button is re-cloned on
each setup call to prevent duplicate listeners stacking across navigations.

---

## Page modules (`pages/*.js`)

Each file exports:

```js
export function render()   { return `<html string>` }  // synchronous, no side effects
export function init()     { /* attach event listeners, start observers */ }
export function prefetch() { /* optional: preload images */ }
```

### Hodge page (`pages/hodge.js`)

Calls `init()` on all 6 sub-calculators (via `hodge/scripts.js` for shared logic),
then handles two cross-cutting concerns:

**`body.hodge-active`**
`styles.css` sets `body { overflow-x: clip }` globally. Large Hodge diamonds need to
overflow their card, so the Hodge page adds `hodge-active` to `<body>`, which triggers
`body.hodge-active { overflow-x: auto }` in `hodge/styles.css`. Removed in `_pageCleanup`.

**Diamond centering**
Each `.diamond-scroll-wrapper` gets a `ResizeObserver` + `MutationObserver` pair. Whenever
the diamond changes (slider, preset, window resize), the callback:
- Gets the `#diamond-box` card's bounding rect
- Sets `container.style.marginLeft` so the diamond's midpoint aligns with the card's midpoint

Negative margins are used rather than `transform: translateX()` because negative margins
extend the element leftward without creating rightward scroll overflow.

The `#inputs` panel has `position: relative; z-index: 1` so it remains interactive even
when a wide diamond's negative margin causes it to visually overlap the inputs.

---

## Hodge calculator architecture

### Shared UI patterns

**Blank-friendly slider ↔ textbox sync**

Allows clearing a textbox and typing a new number without the UI snapping to invalid
intermediate states (e.g. typing "1" into "10" shouldn't momentarily compute for $n=1$).

```
slider "input" → set textbox = slider.value → update
textbox "input" → if blank, update with null (show placeholder); else clamp slider, update
textbox "blur"  → normalize: enforce minimum, sync slider
```

**Degree toggle rows**
When `r` (number of hypersurfaces) changes, `.degree-toggle` rows are added/removed
from `#degree-toggles-*`. Each row holds a label + `.hodge-input` number input.

**`replaceChildren()`**
Diamond DOM is built into an array of `<div.diamond-row>` elements off-screen, then
inserted with one `replaceChildren(...newRows)` call so the container is never
transiently empty — an empty container would trigger the `MutationObserver` centering
callback with a zero-width diamond.

### Calculator 1 — Complete Intersections in ℙⁿ

Delegates to `chiGrassmannianCI.js` with $k=1$, $N=n+1$, exploiting the fact that
$\mathbb{P}^n = \operatorname{Gr}(1, n+1)$.

### Calculator 2 — Abelian Varieties

Closed-form: $h^{p,q}(A) = \binom{g}{p}\binom{g}{q}$. No Schubert calculus.

### Calculator 3 — CIs in Gr(k,n)

The most involved calculator. See [Math flow](#math-flow-for-calculator-3).

### Calculator 4 — Flag Varieties

Uses precomputed JSON files in `components/hodge/flag-hodge/`. In-browser computation
is too expensive for large flag varieties, so results were generated offline.

The module (`flag.js` + `flagHodge.js`) is deferred: not imported until the user first
clicks "Flag Varieties." On hover, `modulepreload` links are injected so the download
starts before the click.

### Calculator 5 — Twisted Hodge Numbers

Computes $H^q(\operatorname{Gr}(k,n),\, \Omega^p \otimes \mathcal{O}(t))$ for integer
twist $t$ (positive or negative). Cells are clickable: a click on $h^{i,j}$ shows the
list of Schubert partitions that contribute to that entry.

### Calculator 6 — CIs in Products of Grassmannians

Handles $Z \subset \operatorname{Gr}(k_1,n_1) \times \cdots \times \operatorname{Gr}(k_s,n_s)$.
Grassmannian factors are managed dynamically via "Add / Remove Factor" buttons.
Degree inputs are vectors (one component per factor).

---

## Math flow for Calculator 3

**Input:** $k < n$, degrees $d_1 \geq \cdots \geq d_r \geq 1$, $s \geq 0$ blow-up points.
Let $m = n-k$, $N = km$ (dimension of $\operatorname{Gr}(k,n)$), $\dim Z = N - r$.

### Step 1 — Hodge numbers of the Grassmannian (`grassmannianHodge.js`)

$\operatorname{Gr}(k,n)$ has $h^{p,q} = 0$ for $p \neq q$ (it is a pure-type variety).
The diagonal values are coefficients of the $q$-binomial:
$$h^{p,p}(\operatorname{Gr}(k,n)) = [q^p]\binom{n}{k}_q$$
computed via the DP recurrence $\binom{n}{k}_q = \binom{n-1}{k-1}_q + q^k\binom{n-1}{k}_q$.

### Step 2 — Euler characteristics χ(Ω^j_Z(t)) (`chiGrassmannianCI.js`)

**Base case** (no hypersurfaces, $Z = \operatorname{Gr}(k,n)$):
$$\chi(\Omega^j_X(t)) = (-1)^j \sum_{\substack{\lambda \subseteq k \times m \\ |\lambda| = j}} f_\lambda(t)$$
where $f_\lambda(t) = \prod_{(a,b) \in [k]\times[m]} \dfrac{h_\lambda(a,b) - t}{h_\lambda(a,b)}$
and $h_\lambda(a,b)$ is the hook length at box $(a,b)$.

**Inductive step** (add a hypersurface of degree $d$ via the Koszul/conormal sequence):
$$\chi(\Omega^j_{Z'}(t)) = \chi(\Omega^j_Z(t)) - \chi(\Omega^j_Z(t-d)) - \chi(\Omega^{j-1}_{Z'}(t-d))$$

All intermediate values are exact `BigInt` rationals to avoid float64 overflow on large
partition sums (e.g. $\operatorname{Gr}(3,10)$ has entries in the billions).

### Step 3 — Hodge numbers from Euler characteristics

By the Lefschetz hyperplane theorem: $h^{p,q}(Z) = h^{p,q}(\operatorname{Gr}(k,n))$
for all $(p,q)$ off the middle antidiagonal. The primitive middle-row entries are:
$$h^{\dim-j,\,j}_\mathrm{prim} = (-1)^{\dim-j}\!\left(\chi(\Omega^j_Z) - (-1)^j a_j\right)$$
where $a_j = h^{j,j}(\operatorname{Gr}(k,n))$. The full entry $h^{j,j}(Z)$ adds back $a_j$
at the center position when $\dim$ is even.

### Step 4 — Blow-up

Each of the $s$ blow-up points adds $1$ to $h^{p,p}(Z)$ for $1 \leq p \leq \dim - 1$.

---

## CSS architecture

### Variables

All colors are CSS custom properties defined on `:root`. Dark mode is applied by adding
`.dark-mode` to `<html>` and overriding the same properties — no `@media` queries
needed. The toggle is user-controlled and persisted to `localStorage`.

### `overflow-x` management

`body { overflow-x: clip }` suppresses horizontal scrollbars on all pages.
The Hodge page overrides this with `body.hodge-active { overflow-x: auto }` (defined in
`hodge/styles.css`, activated by a JS class) so wide diamonds can be scrolled.

### Page transitions

| Direction | Exit class | Enter class |
|---|---|---|
| Forward (higher route index) | `exiting-left` | `entering-from-right` |
| Back (lower route index) | `exiting-right` | `entering-from-left` |
| Same / initial load | `exiting` | `entering` |

All transitions are skipped when `.reduce-motion` is on `<html>`.

---

## Duplicate IDs

Each of the 6 calculator sections reuses the IDs `#hodge-container`, `#inputs`, and
`#diamond-box`. Only one section is visible at a time, but all 6 exist in the DOM.

`document.getElementById()` returns the **first** match — always the Complete Intersection
section, even when it is hidden. When navigating from a child element up to a container,
use `element.closest('[id="diamond-box"]')` or `element.parentElement` traversal.
Calculator-specific containers (e.g. `#diamond-container-grassmannian`) are unique and
safe to fetch with `getElementById`.

---

## Service worker (`sw.js`)

Cache name: `static-shell-v5` — increment to force cache invalidation on deploy.

| Request | Strategy |
|---|---|
| HTML navigation | Cache-first (SPA shell) |
| Images | Cache-first |
| JS / CSS | Stale-while-revalidate |
| Everything else | Network-first |

---

## Testing

```bash
npm test   # runs tests/hodge.test.js with Node's built-in node:test runner
```

The test file imports math modules directly (no DOM) and checks Hodge numbers against
values from the literature:

- Plane curves (conic, cubic, quartic, quintic, sextic)
- Surfaces in $\mathbb{P}^3$ (quadric, cubic, K3)
- Calabi-Yau threefolds and other complete intersections
- Grassmannians: $\operatorname{Gr}(2,4)$, $\operatorname{Gr}(2,5)$, $\operatorname{Gr}(3,6)$
- Abelian varieties of genus 1–4
- Flag varieties: $\operatorname{Fl}(1,2;3)$, $\operatorname{Fl}(1,2,3;4)$
- Twisted Hodge numbers with positive and negative twist
- Products of Grassmannians

---

## Adding a new page

1. Create `pages/mypage.js` exporting `render()` and `init()`.
2. Register it in `scripts/router.js`:
   ```js
   const routes     = { ..., '/mypage': () => import('/pages/mypage.js') }
   const navOrder   = [..., '/mypage']
   const pageTitles = { ..., '/mypage': 'My Page | Andy Huchala' }
   ```
3. Add a nav link in `components/header.js`.
4. Add page-specific CSS at `mypage/styles.css` (link it from `render()`).

## Adding a new Hodge calculator

1. Create `components/hodge/myCalc.js` with an exported `init()`.
2. Add the section HTML to `pages/hodge.js`'s `render()`, following the existing pattern:
   toggle button → container → `#hodge-container` → `#inputs` + `#diamond-box` →
   `.diamond-scroll-wrapper` → `#diamond-container-mycalc`.
3. Import and call `init()` from `pages/hodge.js`.
4. Add `document.getElementById('diamond-container-mycalc')` to the `diamondRoots`
   array in `hodge/scripts.js` (zero-coloring, coordinate annotation, and top-half
   hiding are applied automatically from there).
5. Add a toggle button handler in `hodge/scripts.js`.
6. Add tests in `tests/hodge.test.js`.
