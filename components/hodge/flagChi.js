// =======================================================
// /components/hodge/flagChi.js
//
// Exact Hodge diamonds for smooth complete intersections in
// type-A partial flag varieties, computed in the browser via
// Borel–Weil–Bott — no precomputed data.
//
// Setup. dims = [a_1, …, a_s] (s ≥ 2, a_i ≥ 1) encodes the flag
// variety X = Fl(m_1, …, m_{s-1}; n) of nested subspaces
// V_{m_1} ⊂ … ⊂ V_{m_{s-1}} ⊂ ℂ^n with m_i = a_1 + … + a_i and
// n = m_s.  Pic(X) ≅ ℤ^{s-1} with ample generators
// O(0,…,1_i,…,0) = det(V_{m_i})^∨, so a multidegree is a vector
// t ∈ ℤ^{s-1} and O(t) is ample iff every t_i ≥ 1.
//
// Math flow (all arithmetic exact, BigInt):
//
// 1. χ of a line bundle.  For a T-character w (the fiber weight of
//    the bundle at the standard flag), Bott's theorem gives
//    χ(X, L_w) as the Weyl-dimension value of the dot-regularized
//    weight: reverse w (fiber weight = lowest weight = w_0 of the
//    section weight), add ρ = (n-1, …, 0), return 0 on a repeat,
//    otherwise sign(sorting permutation) × Weyl dimension formula.
//
// 2. χ(Ω^j_X(t)).  Ω^1_X at the base point has T-weights
//    {e_a − e_b : block(a) < block(b)} (the positive roots outside
//    the Levi); Λ^j has the j-fold sums of distinct such roots.
//    Euler characteristics only see the associated graded, so
//    χ(Ω^j_X(t)) = Σ_w mult(w) · χ(L_{w + weight(O(t))}),
//    with the wedge weights collected by a subset-sum DP.
//
// 3. Hypersurfaces.  The Koszul/conormal recurrence (identical to
//    the Grassmannian calculator, but with multidegree twists):
//    χ(Ω^j_{Z_s}(t)) = χ(Ω^j_{Z_{s-1}}(t)) − χ(Ω^j_{Z_{s-1}}(t−d_s))
//                      − χ(Ω^{j-1}_{Z_s}(t−d_s)).
//
// 4. Lefschetz.  Off the middle antidiagonal h^{p,q}(Z) = h^{p,q}(X)
//    (diagonal q-multinomial coefficients); the primitive middle
//    entries are h^{dim−j, j}_prim = (−1)^{dim−j}(χ(Ω^j_Z) − (−1)^j a_j)
//    with a_j = h^{j,j}(X).
// =======================================================

// ---------- small exact helpers ----------

function sum(arr) { return arr.reduce((a, b) => a + b, 0) }

// ∏_{0 ≤ i < j < n} (j − i) = ∏_{k=1}^{n−1} k!  (Weyl denominator for GL_n)
const _superfactCache = new Map()
function superfactorial(n) {
  if (_superfactCache.has(n)) return _superfactCache.get(n)
  let prod = 1n
  let fact = 1n
  for (let k = 1; k < n; k++) {
    fact *= BigInt(k)
    prod *= fact
  }
  _superfactCache.set(n, prod)
  return prod
}

// ---------- 1. Euler characteristic of a line bundle ----------

/**
 * χ(X, L) for the line bundle on any GL_n flag variety whose fiber at the
 * standard flag carries the T-character `w` (array of n integers).
 * Bott: 0 if w is irregular, otherwise ± a Weyl dimension. Exact BigInt.
 */
export function chiFiber(w) {
  const n = w.length
  // Sections convention weight is the reverse of the fiber weight; add ρ.
  // mu[i] = w[n-1-i] + (n-1-i)
  const mu = new Array(n)
  for (let i = 0; i < n; i++) mu[i] = w[n - 1 - i] + (n - 1 - i)

  // Repeated entry → singular weight → χ = 0. Count inversions for the sign.
  let inversions = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (mu[i] === mu[j]) return 0n
      if (mu[i] < mu[j]) inversions++
    }
  }

  const sorted = [...mu].sort((a, b) => b - a)
  let num = 1n
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      num *= BigInt(sorted[i] - sorted[j])
    }
  }
  const value = num / superfactorial(n) // exact: Weyl dimensions are integers
  return (inversions % 2 === 0) ? value : -value
}

// ---------- flag combinatorics ----------

export function flagDim(dims) {
  let d = 0
  for (let p = 0; p < dims.length; p++) {
    for (let q = p + 1; q < dims.length; q++) d += dims[p] * dims[q]
  }
  return d
}

// T-weights of Ω^1_X at the standard flag: e_a − e_b for block(a) < block(b).
function cotangentRoots(dims) {
  const n = sum(dims)
  const block = []
  dims.forEach((a, bi) => { for (let i = 0; i < a; i++) block.push(bi) })
  const roots = []
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (block[a] < block[b]) {
        const w = new Array(n).fill(0)
        w[a] = 1
        w[b] = -1
        roots.push(w)
      }
    }
  }
  return roots
}

// Fiber T-character of O(t) = ⊗_i det(V_{m_i})^{∨ t_i}:  −Σ_i t_i (e_1+…+e_{m_i}).
function lineWeight(dims, t) {
  const n = sum(dims)
  const v = new Array(n).fill(0)
  let m = 0
  for (let i = 0; i < t.length; i++) {
    m += dims[i]
    for (let c = 0; c < m; c++) v[c] -= t[i]
  }
  return v
}

// Guard rails: refuse computations that would not finish promptly.
export const MAX_FLAG_DIM = 20
const MAX_WEDGE_STATES = 250000

/**
 * Multiplicities of the T-weights of Λ^j Ω^1_X for j = 0…jMax.
 * Returns Array<Map<key, {w, c}>> where c is the multiplicity.
 * Subset-sum DP over the cotangent roots; states collapse by weight.
 */
function wedgeWeights(dims, jMax) {
  const roots = cotangentRoots(dims)
  const n = sum(dims)
  const zero = new Array(n).fill(0)
  const levels = [new Map([[zero.join(','), { w: zero, c: 1 }]])]
  for (let j = 1; j <= jMax; j++) levels.push(new Map())

  let states = 1
  for (const root of roots) {
    const hi = Math.min(jMax, levels.length - 1)
    for (let j = hi; j >= 1; j--) {
      for (const { w, c } of levels[j - 1].values()) {
        const nw = w.map((x, i) => x + root[i])
        const key = nw.join(',')
        const entry = levels[j].get(key)
        if (entry) {
          entry.c += c
        } else {
          levels[j].set(key, { w: nw, c })
          states++
          if (states > MAX_WEDGE_STATES) {
            throw new Error('This flag variety is too large for in-browser computation.')
          }
        }
      }
    }
  }
  return levels
}

// ---------- per-flag engine with caches ----------

const _engineCache = new Map() // dimsKey -> engine

function getEngine(dims) {
  const dimsKey = dims.join(',')
  let engine = _engineCache.get(dimsKey)
  if (engine) return engine

  const dimX = flagDim(dims)
  let wedge = null      // built lazily, up to the largest jMax requested
  let wedgeJMax = -1
  const chiOmegaCache = new Map() // "j|t" -> BigInt

  function ensureWedge(jMax) {
    if (jMax > wedgeJMax) {
      wedge = wedgeWeights(dims, jMax)
      wedgeJMax = jMax
    }
  }

  // χ(Ω^j_X ⊗ O(t)), t ∈ ℤ^{s−1}
  function chiOmega(j, t) {
    if (j < 0 || j > dimX) return 0n
    const key = j + '|' + t.join(',')
    const hit = chiOmegaCache.get(key)
    if (hit !== undefined) return hit
    ensureWedge(j)
    const v = lineWeight(dims, t)
    let total = 0n
    for (const { w, c } of wedge[j].values()) {
      const fiber = w.map((x, i) => x + v[i])
      const chi = chiFiber(fiber)
      if (chi !== 0n) total += BigInt(c) * chi
    }
    chiOmegaCache.set(key, total)
    return total
  }

  engine = { dimX, chiOmega }
  _engineCache.set(dimsKey, engine)
  return engine
}

/** χ(Ω^j_X ⊗ O(t)) on the flag variety X given by dims. Exported for tests. */
export function chiOmegaFlag(dims, j, t) {
  validateDims(dims)
  return getEngine(dims).chiOmega(j, t)
}

// ---------- 3. complete intersection recurrence ----------

/**
 * χ(Ω^j_Z ⊗ O(t)) for Z = Z_r the intersection of hypersurfaces of
 * multidegrees degrees[0..r-1] in X. Memoized per call tree.
 */
function buildChiZ(dims, degrees) {
  const { chiOmega } = getEngine(dims)
  const memo = new Map()
  function chiZ(s, j, t) {
    if (j < 0) return 0n
    if (s === 0) return chiOmega(j, t)
    const key = s + '|' + j + '|' + t.join(',')
    const hit = memo.get(key)
    if (hit !== undefined) return hit
    const d = degrees[s - 1]
    const shifted = t.map((x, i) => x - d[i])
    const val = chiZ(s - 1, j, t) - chiZ(s - 1, j, shifted) - chiZ(s, j - 1, shifted)
    memo.set(key, val)
    return val
  }
  return chiZ
}

// ---------- 4. diamond assembly ----------

// Coefficients of the q-multinomial [n; a_1, …, a_s]_q — the diagonal
// Hodge numbers h^{p,p}(X). Plain Numbers (safe: these are Betti numbers
// of a variety of dimension ≤ MAX_FLAG_DIM).
export function qMultinomialCoeffs(dims) {
  // [n; a_1, …, a_s]_q = ∏_i [n_i choose a_i]_q with n_i = a_i + … + a_s.
  // [x choose j]_q via the Pascal DP: [x choose j]_q = [x−1 choose j−1]_q + q^j [x−1 choose j]_q.
  function qBinomial(n, k) {
    if (k < 0 || k > n) return [0]
    let table = [[1]] // table[j] = coefficient array of [x choose j]_q for the current x
    for (let x = 1; x <= n; x++) {
      const next = [[1]]
      for (let j = 1; j <= Math.min(k, x); j++) {
        const a = table[j - 1] ?? [0]            // [x-1 choose j-1]_q
        const b = j <= x - 1 ? table[j] : null   // [x-1 choose j]_q
        const out = a.slice()
        if (b) {
          for (let i = 0; i < b.length; i++) {
            out[i + j] = (out[i + j] ?? 0) + b[i]
          }
        }
        next[j] = out
      }
      table = next
    }
    return table[k]
  }

  let poly = [1]
  let remaining = sum(dims)
  for (const a of dims) {
    const qb = qBinomial(remaining, a)
    const res = new Array(poly.length + qb.length - 1).fill(0)
    for (let i = 0; i < poly.length; i++) {
      for (let j = 0; j < qb.length; j++) res[i + j] += poly[i] * qb[j]
    }
    poly = res
    remaining -= a
  }
  return poly
}

function validateDims(dims) {
  if (!Array.isArray(dims) || dims.length < 2) {
    throw new Error('dims must list at least two dimension jumps.')
  }
  if (dims.some(a => !Number.isInteger(a) || a < 1)) {
    throw new Error('Each entry of dims must be a positive integer.')
  }
  if (flagDim(dims) > MAX_FLAG_DIM) {
    throw new Error(`Flag varieties of dimension > ${MAX_FLAG_DIM} are not supported in-browser.`)
  }
}

function validateDegrees(dims, degrees) {
  const m = dims.length - 1
  for (const d of degrees) {
    if (!Array.isArray(d) || d.length !== m) {
      throw new Error(`Each multidegree must have exactly ${m} components.`)
    }
    if (d.some(x => !Number.isInteger(x) || x < 1)) {
      throw new Error('Each multidegree component must be a positive integer (O(d) must be ample).')
    }
  }
}

/**
 * Full Hodge diamond of a smooth complete intersection of hypersurfaces of
 * the given multidegrees in the flag variety Fl(dims).
 * Returns 2·dimZ+1 antidiagonal rows of BigInt; row i has min(i+1, 2·dimZ+1−i)
 * entries. degrees = [] gives the flag variety itself.
 */
export function hodgeDiamondFlagCI(dims, degrees) {
  validateDims(dims)
  validateDegrees(dims, degrees)

  const dimX = flagDim(dims)
  const r = degrees.length
  const dimZ = dimX - r
  if (dimZ < 0) throw new Error('Number of hypersurfaces exceeds the dimension of the flag variety.')

  const aDiag = qMultinomialCoeffs(dims) // aDiag[p] = h^{p,p}(X)

  // Ambient rows (used verbatim off the middle, by Lefschetz).
  function ambientRow(i) {
    const rowSize = i + 1 // only called with i ≤ dimZ ≤ dimX
    const row = new Array(rowSize).fill(0n)
    if (i % 2 === 0) row[i / 2] = BigInt(aDiag[i / 2] ?? 0)
    return row
  }

  // Middle row.
  let midFull
  if (r === 0) {
    midFull = ambientRow(dimZ)
  } else {
    const chiZ = buildChiZ(dims, degrees)
    const zero = new Array(dims.length - 1).fill(0)
    const half = Math.floor(dimZ / 2)
    const midHalf = []
    for (let j = 0; j <= half; j++) {
      const chiVal = chiZ(r, j, zero)
      const a = BigInt(aDiag[j] ?? 0)
      const chiSign = (j % 2 === 0) ? 1n : -1n
      const sign = ((dimZ - j) % 2 === 0) ? 1n : -1n
      let prim = sign * (chiVal - chiSign * a)
      // h^{j,j} of Z also carries the ambient class when j = dimZ/2.
      if (dimZ % 2 === 0 && j === half) prim += a
      midHalf.push(prim)
    }
    midFull = (dimZ % 2 === 1)
      ? midHalf.concat([...midHalf].reverse())
      : midHalf.concat([...midHalf].reverse().slice(1))
  }

  const rows = []
  for (let i = 0; i <= 2 * dimZ; i++) {
    if (i === dimZ) rows.push(midFull)
    else rows.push(ambientRow(i <= dimZ ? i : 2 * dimZ - i))
  }
  return rows
}
