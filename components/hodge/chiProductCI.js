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
//   degrees: [[d₁,…,dₛ], …]       one tuple per hypersurface
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
