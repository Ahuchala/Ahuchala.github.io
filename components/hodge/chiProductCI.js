// ============================================================
// chiProductCI.js
//
// Computes the Hodge diamond of a smooth complete intersection
// Z in a product X = Gr(k1, n1) × Gr(k2, n2).
//
// Algorithm:
//   1. Künneth base case:
//        χ(Ω^j_X(t1,t2)) = Σ_{j1+j2=j} χ(Ω^{j1}_{Gr(k1,n1)}(t1))
//                                       · χ(Ω^{j2}_{Gr(k2,n2)}(t2))
//   2. Multi-twist Koszul recurrence (t is now a tuple [t1,t2]):
//        χ(Ω^j_{Zs}(t)) = χ(Ω^j_{Zs-1}(t))
//                        − χ(Ω^j_{Zs-1}(t−ds))
//                        − χ(Ω^{j-1}_{Zs}(t−ds))
//   3. Diagonal entries a[p] = h^{p,p}(X):
//        convolution of per-factor partition-count arrays.
//
// Export: hodgeDiamondProduct(k1, n1, k2, n2, degrees)
//   degrees: array of r tuples [d1, d2], one per hypersurface.
//   Returns a 2D array (same shape as hodgeGrassmannian /
//   hodgeDiamondCI): 2*dim+1 rows, row i has min(i+1,2*dim+1-i)
//   entries.
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
// χ(Ω^j_{Gr(k1,n1)×Gr(k2,n2)}(t1, t2))  as a BigInt fraction.
function chiProductExact(k1, n1, k2, n2, j, t1, t2) {
  const dim1 = k1 * (n1 - k1);
  const dim2 = k2 * (n2 - k2);
  let sum = [0n, 1n];
  for (let j1 = Math.max(0, j - dim2); j1 <= Math.min(j, dim1); j1++) {
    const j2 = j - j1;
    const f1 = chiGrassmannianExact(k1, n1, j1, t1);
    const f2 = chiGrassmannianExact(k2, n2, j2, t2);
    sum = addFrac(sum, mulFrac(f1, f2));
  }
  return sum;
}

// --- Memoized Koszul recurrence ---
// t = [t1, t2], degrees[s-1] = [d1, d2]
// All values are BigInt fractions [num, den].
function buildChiProductCI(k1, n1, k2, n2, degrees) {
  const cache = new Map();

  function chi(s, j, t) {
    if (j < 0) return [0n, 1n];
    const key = `${s},${j},${t[0]},${t[1]}`;
    if (cache.has(key)) return cache.get(key);
    let val;
    if (s === 0) {
      val = chiProductExact(k1, n1, k2, n2, j, t[0], t[1]);
    } else {
      const d = degrees[s - 1]; // [d1, d2]
      const td = [t[0] - d[0], t[1] - d[1]];
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

// --- Diagonal entries: convolution of per-factor partition counts ---
// a[j] = Σ_{j1+j2=j} #{partitions of j1 in k1×(n1-k1) box}
//                   · #{partitions of j2 in k2×(n2-k2) box}
function productPartitionCounts(k1, n1, k2, n2, maxJ) {
  const m1 = n1 - k1;
  const m2 = n2 - k2;
  const a1 = [];
  const a2 = [];
  for (let j = 0; j <= maxJ; j++) {
    let c1 = 0, c2 = 0;
    for (const _ of partitionsInBox(k1, m1, j)) c1++;
    for (const _ of partitionsInBox(k2, m2, j)) c2++;
    a1.push(c1);
    a2.push(c2);
  }
  const a = [];
  for (let j = 0; j <= maxJ; j++) {
    let s = 0;
    for (let j1 = 0; j1 <= j; j1++) {
      s += (a1[j1] ?? 0) * (a2[j - j1] ?? 0);
    }
    a.push(s);
  }
  return a;
}

// --- Main export ---
// degrees: array of [d1, d2] tuples (one per hypersurface).
// Returns the full Hodge diamond as a 2D array in the same
// convention as hodgeDiamondCI / hodgeGrassmannian.
export function hodgeDiamondProduct(k1, n1, k2, n2, degrees) {
  const dim = k1 * (n1 - k1) + k2 * (n2 - k2) - degrees.length;
  if (dim < 0) throw new Error("dim Z < 0: too many hypersurfaces");

  const r = degrees.length;
  const chi = buildChiProductCI(k1, n1, k2, n2, degrees);
  const a = productPartitionCounts(k1, n1, k2, n2, dim);

  // Primitive middle-row Hodge numbers (half-diamond, j = 0..floor(dim/2)).
  const half = Math.floor(dim / 2);
  const isOdd = dim % 2 === 1;
  const prim = [];
  for (let j = 0; j <= half; j++) {
    const chiVal = fracToNumber(chi(r, j, [0, 0]));
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
    for (let j = half; j >= 0; j--) midFull.push(midHalf[j]);
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
