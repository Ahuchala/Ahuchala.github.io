// ============================================================
// chiProductCI.js
//
// Computes the Hodge diamond of a smooth complete intersection
// Z in a product X = Gr(k₁,n₁) × … × Gr(kₛ,nₛ).
//
// Algorithm:
//   1. Künneth base case (iterative convolution over factors):
//        χ(Ω^j_X(t)) = Σ_{j₁+…+jₛ=j} ∏ᵢ χ(Ω^{jᵢ}_{Gr(kᵢ,nᵢ)}(tᵢ))
//   2. Multi-twist Koszul recurrence (t is now a length-s tuple):
//        χ(Ω^j_{Zₛ}(t)) = χ(Ω^j_{Zₛ₋₁}(t))
//                        − χ(Ω^j_{Zₛ₋₁}(t−dₛ))
//                        − χ(Ω^{j-1}_{Zₛ}(t−dₛ))
//   3. Diagonal entries a[p] = h^{p,p}(X):
//        iterative convolution of per-factor partition-count arrays.
//
// Export: hodgeDiamondProduct(factors, degrees)
//   factors: [{k, n}, …]          one entry per Grassmannian factor
//   degrees: [[d₁,…,dₛ], …]       one tuple per hypersurface; entries may be
//                                 0 when supports are nested or disjoint
//                                 (see hodgeSquareSupportTree below)
//   Returns a 2D array (same shape as hodgeDiamondCI / hodgeGrassmannian):
//   2*dim+1 rows, row i has min(i+1, 2*dim+1-i) entries.
// ============================================================

import {
  partitionsInBox,
  chiGrassmannianExact,
  fracToNumber,
  reduce,
  addFrac,
  subFrac,
} from "./chiGrassmannianCI.js";

// --- mulFrac is the one helper not in chiGrassmannianCI.js ---
function mulFrac([a, b], [c, d]) {
  return reduce(a * c, b * d);
}

// --- Künneth base case ---
// χ(Ω^j_{Gr(k₁,n₁)×…}(t₁,…)) as a BigInt fraction.
// Iteratively convolves over all factors.
function chiProductExact(factors, j, t) {
  // result[jAcc] = χ of partial product at form-degree jAcc
  let result = new Array(j + 1).fill(null).map(() => [0n, 1n]);
  result[0] = [1n, 1n]; // empty product contributes 1 at j=0

  for (let fi = 0; fi < factors.length; fi++) {
    const { k, n } = factors[fi];
    const dimFi = k * (n - k);
    const tf = t[fi];
    const next = new Array(j + 1).fill(null).map(() => [0n, 1n]);
    for (let jAcc = 0; jAcc <= j; jAcc++) {
      if (result[jAcc][0] === 0n) continue;
      for (let jf = 0; jf <= Math.min(j - jAcc, dimFi); jf++) {
        const chiF = chiGrassmannianExact(k, n, jf, tf);
        next[jAcc + jf] = addFrac(next[jAcc + jf], mulFrac(result[jAcc], chiF));
      }
    }
    result = next;
  }
  return result[j] ?? [0n, 1n];
}

// --- Memoized Koszul recurrence ---
// t = [t₁,…,tₛ], degrees[s-1] = [d₁,…,dₛ]
// All values are BigInt fractions [num, den].
function buildChiProductCI(factors, degrees) {
  const cache = new Map();

  function chi(s, j, t) {
    if (j < 0) return [0n, 1n];
    const key = `${s},${j},${t.join(",")}`;
    if (cache.has(key)) return cache.get(key);
    let val;
    if (s === 0) {
      val = chiProductExact(factors, j, t);
    } else {
      const d  = degrees[s - 1];
      const td = t.map((ti, i) => ti - d[i]);
      val = subFrac(
        subFrac(chi(s - 1, j, t), chi(s - 1, j, td)),
        chi(s, j - 1, td)
      );
    }
    cache.set(key, val);
    return val;
  }

  return chi;
}

// --- Diagonal entries: iterative convolution of per-factor partition counts ---
// a[j] = Σ_{j₁+…+jₛ=j} ∏ᵢ #{partitions of jᵢ in kᵢ×(nᵢ-kᵢ) box}
function productPartitionCounts(factors, maxJ) {
  let a = [1]; // identity element for convolution (empty product)
  for (const { k, n } of factors) {
    const m = n - k;
    const aFi = [];
    for (let j = 0; j <= maxJ; j++) {
      let c = 0;
      for (const _ of partitionsInBox(k, m, j)) c++;
      aFi.push(c);
    }
    const newA = new Array(maxJ + 1).fill(0);
    for (let j1 = 0; j1 <= maxJ; j1++) {
      for (let j2 = 0; j1 + j2 <= maxJ; j2++) {
        newA[j1 + j2] += (a[j1] ?? 0) * (aFi[j2] ?? 0);
      }
    }
    a = newA;
  }
  return a;
}

// --- Main export ---
// factors: [{k, n}, …] (one per Grassmannian factor).
// degrees: array of length-s tuples, one per hypersurface.
// Returns the full Hodge diamond as a 2D array in the same
// convention as hodgeDiamondCI / hodgeGrassmannian.
export function hodgeDiamondProduct(factors, degrees) {
  const totalDim = factors.reduce((s, { k, n }) => s + k * (n - k), 0);
  const dim = totalDim - degrees.length;
  if (dim < 0) throw new Error("dim Z < 0: too many hypersurfaces");
  // Zero entries make some cuts non-ample on X; use the support tree instead.
  if (degrees.some(d => d.some(x => x === 0))) {
    return squareToDiamond(hodgeSquareSupportTree(factors, degrees));
  }

  const r  = degrees.length;
  const t0 = new Array(factors.length).fill(0);
  const chi = buildChiProductCI(factors, degrees);
  const a   = productPartitionCounts(factors, dim);

  // Primitive middle-row Hodge numbers (half-diamond, j = 0..floor(dim/2)).
  const half   = Math.floor(dim / 2);
  const isOdd  = dim % 2 === 1;
  const prim   = [];
  for (let j = 0; j <= half; j++) {
    const chiVal  = fracToNumber(chi(r, j, t0));
    const sign    = ((dim - j) % 2 === 0) ? 1 : -1;
    const chiSign = (j % 2 === 0)         ? 1 : -1;
    prim.push(Math.round(sign * (chiVal - chiSign * a[j])));
  }

  // Build full middle row.
  // For even dim, the central entry j=half also gets a[half] (Grassmannian diagonal).
  const midHalf = prim.map((p, j) =>
    p + (!isOdd && j === half ? a[half] : 0)
  );
  const midFull = [...midHalf];
  if (isOdd) {
    for (let j = half;     j >= 0; j--) midFull.push(midHalf[j]);
  } else {
    for (let j = half - 1; j >= 0; j--) midFull.push(midHalf[j]);
  }

  // Build full diamond array.
  const totalRows = 2 * dim + 1;
  return Array.from({ length: totalRows }, (_, i) => {
    const rowSize = i <= dim ? i + 1 : 2 * dim - i + 1;
    const row = new Array(rowSize).fill(0);
    if (i === dim) {
      // Middle row: full Hodge numbers.
      for (let j = 0; j < rowSize; j++) row[j] = midFull[j];
    } else {
      // Non-middle row: only diagonal h^{p,p} is non-zero (Lefschetz + Hodge).
      const mirrorI = i < dim ? i : 2 * dim - i;
      if (mirrorI % 2 === 0) {
        const colJ = mirrorI / 2;
        if (colJ < rowSize) row[colJ] = a[colJ];
      }
    }
    return row;
  });
}

// ============================================================
// Support-tree extension: multidegrees with zero entries.
//
// The support of an equation is the set of factors on which its degree is
// positive. When every pair of supports is nested or disjoint, the CI is
// built bottom-up: combine the varieties on child supports by Künneth, then
// cut by each equation whose support is exactly the current node. That
// equation is very ample on the node's subproduct, so Lefschetz and duality
// give every entry of the cut except the middle row, and the middle row is
// recovered from χ(Ω^p), computed by the Koszul recurrence on the node's
// subproduct with all equations applied so far.
// See hodge-catalogue/NONAMPLE-SUPPORT-TREE-REPORT.md.
//
// Squares here are full arrays h[p][q] = h^{p,q}.
// ============================================================

export class UnsupportedSupportError extends Error {}
export class EmptyIntersectionError extends Error {}

function productSquares(left, right) {
  const n = left.length - 1, m = right.length - 1;
  const out = Array.from({ length: n + m + 1 }, () => new Array(n + m + 1).fill(0));
  for (let p = 0; p <= n; p++) for (let q = 0; q <= n; q++) {
    const a = left[p][q];
    if (!a) continue;
    for (let r = 0; r <= m; r++) for (let s = 0; s <= m; s++) {
      const b = right[r][s];
      if (b) out[p + r][q + s] += a * b;
    }
  }
  return out;
}

function eulerForms(h) {
  return h.map(row => row.reduce((acc, x, q) => acc + (q % 2 ? -x : x), 0));
}

// Positivity, Hodge symmetry, Serre duality, hard Lefschetz injectivity.
function checkSquare(h) {
  const n = h.length - 1;
  if (n < 0 || h.some(row => row.length !== n + 1)) throw new Error("Hodge array is not square");
  for (let p = 0; p <= n; p++) for (let q = 0; q <= n; q++) {
    const x = h[p][q];
    if (!Number.isSafeInteger(x) || x < 0 || x !== h[q][p] || x !== h[n - p][n - q]) {
      throw new Error("Hodge positivity, symmetry, or duality failed");
    }
    if (p && q && p + q <= n && x < h[p - 1][q - 1]) throw new Error("Hard Lefschetz injectivity failed");
  }
}

function exactInt([num, den]) {
  if (den !== 1n) throw new Error("Non-integral Euler characteristic");
  return Number(num);
}

// Smooth ample divisor D ⊂ Y from h(Y) and chi[p] = χ(Ω^p_D).
function ampleCut(h, chi) {
  checkSquare(h);
  const n = h.length - 2;
  if (n < 0) throw new EmptyIntersectionError("A general section on a finite set of points is empty");
  const out = Array.from({ length: n + 1 }, (_, p) =>
    Array.from({ length: n + 1 }, (_, q) =>
      p + q < n ? h[p][q] : p + q > n ? h[n - p][n - q] : 0));
  for (let p = 0; p <= n; p++) {
    const q = n - p;
    let known = 0;
    for (let j = 0; j <= n; j++) if (j !== q) known += (j % 2 ? -1 : 1) * out[p][j];
    out[p][q] = q % 2 ? known - chi[p] : chi[p] - known;
    if (out[p][q] < h[p][q]) throw new Error("Weak Lefschetz middle-degree injectivity failed");
  }
  checkSquare(out);
  if (eulerForms(out).some((x, p) => x !== chi[p])) throw new Error("Euler-characteristic reconstruction failed");
  return out;
}

function grassmannianSquare(k, n) {
  const d = k * (n - k);
  const h = Array.from({ length: d + 1 }, () => new Array(d + 1).fill(0));
  for (let p = 0; p <= d; p++) {
    let c = 0;
    for (const _ of partitionsInBox(k, n - k, p)) c++;
    h[p][p] = c;
  }
  return h;
}

// factors: [{k, n}, …]; degrees: [[d₁,…,dₛ], …] with entries ≥ 0.
// Returns the square array h[p][q], or throws UnsupportedSupportError /
// EmptyIntersectionError / Error.
export function hodgeSquareSupportTree(factors, degrees) {
  const s = factors.length;
  if (degrees.some(d => d.length !== s || d.some(x => !Number.isInteger(x) || x < 0))) {
    throw new Error("Each multidegree needs one nonnegative integer per factor");
  }
  if (degrees.some(d => d.every(x => x === 0))) {
    throw new Error("An all-zero multidegree cuts out the empty set");
  }

  // Supports as sorted index lists, keyed by string.
  const supports = degrees.map(d => d.flatMap((x, i) => (x > 0 ? [i] : [])));
  const keyOf = a => a.join(",");
  const distinct = [...new Map(supports.map(a => [keyOf(a), a])).values()];
  const subset = (a, b) => a.every(i => b.includes(i));
  const meets = (a, b) => a.some(i => b.includes(i));
  for (const a of distinct) for (const b of distinct) {
    if (meets(a, b) && !subset(a, b) && !subset(b, a)) {
      throw new UnsupportedSupportError(`Supports {${a.map(i => i + 1)}} and {${b.map(i => i + 1)}} cross`);
    }
  }
  const dims = factors.map(({ k, n }) => k * (n - k));
  for (const a of distinct) {
    const count = supports.filter(b => subset(b, a)).length;
    if (count > a.reduce((acc, i) => acc + dims[i], 0)) {
      throw new EmptyIntersectionError(`Too many equations supported on factors {${a.map(i => i + 1)}}`);
    }
  }

  function build(a) {
    const proper = distinct.filter(b => b.length < a.length && subset(b, a));
    const children = proper.filter(b => !proper.some(c => c.length > b.length && subset(b, c)));
    let h = [[1]];
    const applied = [];
    for (const b of children) {
      const [child, used] = build(b);
      h = productSquares(h, child);
      applied.push(...used);
    }
    for (const i of a) {
      if (!children.some(b => b.includes(i))) h = productSquares(h, grassmannianSquare(factors[i].k, factors[i].n));
    }
    const own = supports.flatMap((b, j) => (keyOf(b) === keyOf(a) ? [j] : []));
    if (own.length) {
      const subFactors = a.map(i => factors[i]);
      const order = [...applied, ...own];
      const chi = buildChiProductCI(subFactors, order.map(j => a.map(i => degrees[j][i])));
      const t0 = new Array(a.length).fill(0);
      for (let c = 0; c < own.length; c++) {
        const cuts = applied.length + c + 1;
        const nAfter = h.length - 2;
        const chiVals = Array.from({ length: Math.max(nAfter + 1, 0) }, (_, p) => exactInt(chi(cuts, p, t0)));
        h = ampleCut(h, chiVals);
      }
      applied.push(...own);
    }
    return [h, applied];
  }

  const root = factors.map((_, i) => i);
  const [h, applied] = build(root);
  if (applied.length !== degrees.length || new Set(applied).size !== degrees.length) {
    throw new Error("Support tree did not apply every equation exactly once");
  }
  checkSquare(h);
  return h;
}

// Square h[p][q] → diamond rows in the hodgeDiamondProduct convention
// (row i has antidiagonal p+q = 2N−i, leftmost entry has the largest p).
export function squareToDiamond(h) {
  const N = h.length - 1;
  return Array.from({ length: 2 * N + 1 }, (_, idx) => {
    const r = 2 * N - idx;
    const row = [];
    for (let p = Math.min(r, N); p >= Math.max(0, r - N); p--) row.push(h[p][r - p]);
    return row;
  });
}
