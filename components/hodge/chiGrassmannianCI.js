// ============================================================
// chiGrassmannianCI.js
//
// Computes χ(Ω^j_Z(t)) for a complete intersection Z of given
// degrees in the Grassmannian Gr(k, n), using the f_λ(t)
// hook-length formula and the Koszul/conormal recurrence.
//
// Exports: chiCI(k, n, degrees, t = 0)
//   Returns an array of length (dim Z + 1) with
//   [χ(Ω^0_Z(t)), χ(Ω^1_Z(t)), ..., χ(Ω^{dim}_Z(t))].
// ============================================================

// --- Enumerate all partitions λ in the k × m box with |λ| = target.
// Yields arrays (non-increasing, first entry ≤ m, length ≤ k).
function* partitionsInBox(k, m, target, maxFirst = m, len = 0, partial = []) {
  if (target === 0) { yield partial.slice(); return; }
  if (len === k || target <= 0) return;
  const hi = Math.min(maxFirst, target);
  for (let v = hi; v >= 1; v--) {
    partial.push(v);
    yield* partitionsInBox(k, m, target - v, v, len + 1, partial);
    partial.pop();
  }
}

// --- Conjugate (transpose) of λ, padded to length m.
function conjugate(lambda, m) {
  const t = new Array(m).fill(0);
  for (let a = 0; a < lambda.length; a++) {
    for (let b = 0; b < lambda[a]; b++) t[b]++;
  }
  return t;
}

// --- Hook length h_λ(a, b) for 1-indexed a ∈ [1,k], b ∈ [1,m].
// λ is 0-indexed (λ[0] = λ_1, etc.); λ_a = 0 for a > len(λ).
// λ^T is already computed and 0-indexed.
function hookLength(lambda, lambdaT, a, b) {
  const la = a <= lambda.length ? lambda[a - 1] : 0;
  const lb = b <= lambdaT.length ? lambdaT[b - 1] : 0;
  return la + lb - a - b + 1;
}

// --- f_λ(t): product over all (a,b) in [1,k]×[1,m].
// If any h_λ(a,b) = 0: returns 1 when t = 0, else returns 0.
function fLambda(lambda, k, m, t) {
  const lT = conjugate(lambda, m);
  let num = 1;
  let den = 1;
  for (let a = 1; a <= k; a++) {
    for (let b = 1; b <= m; b++) {
      const h = hookLength(lambda, lT, a, b);
      if (h === 0) {
        if (t !== 0) return 0;
        // h = 0, t = 0: factor (h-t)/h = 0/0 → L'Hôpital → 1; skip it
      } else {
        num *= (h - t);
        den *= h;
      }
    }
  }
  return num / den;
}

// --- χ(Ω^j_X(t)) for the Grassmannian X = Gr(k,n).
// = (-1)^j * Σ_{λ : |λ|=j, λ in k×m box} f_λ(t)
function chiGrassmannian(k, n, j, t) {
  const m = n - k;
  if (j < 0 || j > k * m) return 0;
  let sum = 0;
  for (const lambda of partitionsInBox(k, m, j)) {
    sum += fLambda(lambda, k, m, t);
  }
  return (j % 2 === 0 ? 1 : -1) * sum;
}

// --- Memoized recurrence for the CI.
// χ(Ω^j_{Z_s}(t)) = χ(Ω^j_{Z_{s-1}}(t))
//                  - χ(Ω^j_{Z_{s-1}}(t - d_s))
//                  - χ(Ω^{j-1}_{Z_s}(t - d_s))
function buildChiCI(k, n, degrees) {
  const cache = new Map();

  function chi(s, j, t) {
    if (j < 0) return 0;
    const key = `${s},${j},${t}`;
    if (cache.has(key)) return cache.get(key);
    let val;
    if (s === 0) {
      val = chiGrassmannian(k, n, j, t);
    } else {
      const d = degrees[s - 1];
      val = chi(s - 1, j, t)
          - chi(s - 1, j, t - d)
          - chi(s,     j - 1, t - d);
    }
    cache.set(key, val);
    return val;
  }

  return chi;
}

// --- Main export.
// Returns [χ(Ω^0_Z(t)), ..., χ(Ω^{dim Z}_Z(t))].
export function chiCI(k, n, degrees, t = 0) {
  const dim = k * (n - k) - degrees.length;
  if (dim < 0) throw new Error("Too many equations: dim Z < 0");
  const chi = buildChiCI(k, n, degrees);
  const r = degrees.length;
  return Array.from({ length: dim + 1 }, (_, j) => chi(r, j, t));
}

// --- Primitive middle-row Hodge numbers for rendering.
// Returns an array of length floor(dim/2)+1 where entry j is
// h^{dim-j, j}_prim = (-1)^{dim-j} * (χ(Ω^j_Z) - (-1)^j * a_j)
// and a_j = #{partitions in k×m box of size j}.
//
// This is the format consumed by constructMiddleRow/renderDiamond in
// grassmannian.js: renderDiamond adds h^{j,j}(Gr(k,n)) on top for the
// diagonal entry when dim is even.
// --- Full Hodge diamond for a CI Z in Gr(k,n).
// Returns a 2D array in the same format as hodgeGrassmannian:
//   2*dim+1 rows; row i has min(i+1, 2*dim+1-i) entries.
// Non-middle rows: h^{p,p} from Grassmannian (Lefschetz + Hodge duality), all else 0.
// Middle row: primitive Hodge numbers + Grassmannian diagonal contribution.
export function hodgeDiamondCI(k, n, degrees) {
  const m = n - k;
  const dim = k * m - degrees.length;
  if (dim < 0) throw new Error("dim Z < 0");

  // a[j] = #{partitions in k×m box of size j} = h^{j,j}(Gr(k,n))
  const a = [];
  for (let j = 0; j <= dim; j++) {
    let count = 0;
    for (const _ of partitionsInBox(k, m, j)) count++;
    a.push(count);
  }

  // Build full middle row from primitive values + Grassmannian diagonal.
  // Grassmannian contributes a[half] only at j=half when dim is even.
  const prim = hodgePrimitiveMiddleRow(k, n, degrees);
  const half = Math.floor(dim / 2);
  const isOdd = dim % 2 === 1;
  const midHalf = prim.map((p, j) =>
    p + (!isOdd && j === half ? a[half] : 0)
  );
  const midFull = [...midHalf];
  if (isOdd) {
    for (let j = half; j >= 0; j--) midFull.push(midHalf[j]);
  } else {
    for (let j = half - 1; j >= 0; j--) midFull.push(midHalf[j]);
  }

  const totalRows = 2 * dim + 1;
  const diamond = [];
  for (let i = 0; i < totalRows; i++) {
    const rowSize = i <= dim ? i + 1 : 2 * dim - i + 1;
    const row = new Array(rowSize).fill(0);
    if (i === dim) {
      for (let j = 0; j < rowSize; j++) row[j] = midFull[j];
    } else {
      // Non-middle: only diagonal entry h^{p,p} is nonzero.
      // mirrorI = row index in the "above-middle" half (same for below by Serre duality).
      // colJ = mirrorI/2 is the column of the diagonal entry (if mirrorI is even).
      const mirrorI = i < dim ? i : 2 * dim - i;
      if (mirrorI % 2 === 0) {
        const colJ = mirrorI / 2;
        if (colJ < rowSize) row[colJ] = a[colJ];
      }
    }
    diamond.push(row);
  }
  return diamond;
}

export function hodgePrimitiveMiddleRow(k, n, degrees) {
  const m = n - k;
  const dim = k * m - degrees.length;
  if (dim < 0) throw new Error("dim Z < 0");
  const chi = buildChiCI(k, n, degrees);
  const r = degrees.length;
  const half = Math.floor(dim / 2);
  const result = [];
  for (let j = 0; j <= half; j++) {
    const chiVal = chi(r, j, 0);
    let a_j = 0;
    for (const _ of partitionsInBox(k, m, j)) a_j++;
    const sign     = ((dim - j) % 2 === 0) ? 1 : -1;
    const chiSign  = (j % 2 === 0) ? 1 : -1;
    result.push(Math.round(sign * (chiVal - chiSign * a_j)));
  }
  return result;
}
