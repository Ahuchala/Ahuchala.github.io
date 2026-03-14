// =======================================================
// /components/hodge/twistedHodge.js
// =======================================================

// --- exact integer Schur dimension (Weyl formula, direct BigInt)
// All factors (beta[a] - beta[b] + (b-a)) are strictly positive because
// beta+ρ is strictly decreasing after sorting.  The formula always yields
// an integer by Weyl's theorem, so BigInt division is exact — the original
// O(n⁴) GCD pre-cancellation loop is unnecessary.
function schurDimension(beta) {
  const n = beta.length;
  let num = 1n;
  let den = 1n;
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      num *= BigInt(beta[a] - beta[b] + (b - a));
      den *= BigInt(b - a);
    }
  }
  return Number(num / den);
}

// --- q-binomial (Gaussian binomial) coefficients
function qBinomialCoeffs(n, k) {
  const N = k * (n - k);
  let poly = new Array(N + 1).fill(0);
  poly[0] = 1;

  for (let i = 1; i <= k; i++) {
    const a = n - k + i;
    const poly2 = new Array(N + 1).fill(0);
    for (let d = 0; d <= N; d++) {
      poly2[d] += poly[d];
      if (d + a <= N) poly2[d + a] -= poly[d];
    }

    const next = new Array(N + 1).fill(0);
    for (let d = 0; d <= N; d++) {
      let s = 0;
      for (let x = d; x >= 0; x -= i) s += poly2[x];
      next[d] = s;
    }
    poly = next;
  }

  return poly;
}

// --- t-skew: μ ↦ λ (t-core)
function tSkew(mu, t) {
  const m = [...mu];
  const n = m.length;
  const l = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const j = i + t - m[i];
    l[i] = (j < n) ? m[i] + l[j] : m[i];
  }
  while (l.length && l[l.length - 1] === 0) l.pop();
  return l;
}

// --- bounded partitions in (maxPart) × (maxLen)
// Buffer-based: reuses a single preallocated array and yields slices,
// eliminating the O(k) prefix.concat() allocations per yielded partition.
function* boundedPartitions(maxPart, maxLen) {
  yield [];
  if (maxLen === 0 || maxPart === 0) return;
  const buf = new Array(maxLen);
  function* rec(maxVal, len) {
    for (let next = Math.min(maxVal, maxPart); next > 0; next--) {
      buf[len] = next;
      yield buf.slice(0, len + 1);
      if (len + 1 < maxLen) yield* rec(next, len + 1);
    }
  }
  yield* rec(maxPart, 0);
}

// --- transpose of a partition
// O(|λ|) double-loop replaces the O(k·w) filter-per-column approach.
function transposePartition(lambda) {
  if (!lambda.length) return [];
  const w = Math.max(...lambda);
  const tpose = new Array(w).fill(0);
  for (let i = 0; i < lambda.length; i++) {
    for (let j = 0; j < lambda[i]; j++) tpose[j]++;
  }
  return tpose;
}

// =======================================================
// Core computation (internal — call hodgeTwisted instead)
// =======================================================
function _computeHodgeTwisted(k, n, t) {
  const nMinusK = n - k;
  const N = k * (n - k);

  // --- Serre duality for t < 0
  if (t < 0) {
    const pos = hodgeTwisted(k, n, -t);
    return (pos || []).map(({ i, j, lambda, beta, dimension }) => ({
      i: N - i,
      j: N - j,
      lambda,
      beta,
      dimension,
    }));
  }

  // --- t = 0: q-binomial shortcut (all mass on i = j diagonal)
  if (t === 0) {
    const coeffs = qBinomialCoeffs(n, k);
    const out = [];
    for (let j = 0; j <= N; j++) {
      const c = coeffs[j] | 0;
      if (c !== 0) out.push({ i: j, j, lambda: [], beta: [], dimension: c });
    }
    return out;
  }

  // Precompute shift and rho once per call — they depend only on n, not on λ.
  // The original code rebuilt both arrays inside every partition's processing block.
  const shift = Array.from({ length: n }, (_, i) => n - i);      // [n, n-1, …, 1]
  const rho   = Array.from({ length: n }, (_, i) => n - i - 1);  // [n-1, n-2, …, 0]

  const results = [];
  const seen = new Set();

  // --- Fast path: t >= n ⇒ every λ ⊆ k×(n−k) is a t-core
  if (t >= n) {
    for (const lambda of boundedPartitions(nMinusK, k)) {
      if (lambda.length > k || Math.max(0, ...lambda) > nMinusK) continue;

      const key = lambda.join(",");
      if (seen.has(key)) continue;
      seen.add(key);

      // α = (−rev(λᵀ), λ−t)
      const lamT = transposePartition(lambda);
      lamT.reverse(); // reverse in-place (was: [...lamT].reverse())

      const alpha = new Array(n).fill(0);
      const startL = nMinusK - lamT.length;
      for (let i = 0; i < lamT.length; i++) alpha[startL + i] = -lamT[i];

      const lambdaLen = lambda.length;
      for (let i = 0; i < k; i++) {
        alpha[nMinusK + i] = (i < lambdaLen ? lambda[i] : 0) - t;
      }

      // distinctness of α + shift
      const shiftedSet = new Set();
      let allDistinct = true;
      for (let i = 0; i < n; i++) {
        const v = alpha[i] + shift[i];
        if (shiftedSet.has(v)) { allDistinct = false; break; }
        shiftedSet.add(v);
      }
      if (!allDistinct) continue;

      // β = sort(α + ρ) − ρ
      const aPlusRho = alpha.map((x, i) => x + rho[i]);
      aPlusRho.sort((a, b) => b - a);
      const beta = aPlusRho.map((x, i) => x - rho[i]);

      const j = lambda.reduce((a, b) => a + b, 0);
      results.push({ i: 0, j, lambda, beta, dimension: schurDimension(beta) });
    }
    return results;
  }

  // --- General case: enumerate μ in (t−1)×k, map μ ↦ λ via tSkew
  for (const mu of boundedPartitions(t - 1, k)) {
    const lambda = tSkew(mu, t);

    if (lambda.length > k || Math.max(0, ...lambda) > nMinusK) continue;

    const key = lambda.join(",");
    if (seen.has(key)) continue;
    seen.add(key);

    // α = (−rev(λᵀ), λ−t)
    const lamT = transposePartition(lambda);
    lamT.reverse();

    const alpha = new Array(n).fill(0);
    const startL = nMinusK - lamT.length;
    for (let i = 0; i < lamT.length; i++) alpha[startL + i] = -lamT[i];

    const lambdaLen = lambda.length;
    for (let i = 0; i < k; i++) {
      alpha[nMinusK + i] = (i < lambdaLen ? lambda[i] : 0) - t;
    }

    // distinctness of α + shift
    const shiftedSet = new Set();
    let allDistinct = true;
    for (let i = 0; i < n; i++) {
      const v = alpha[i] + shift[i];
      if (shiftedSet.has(v)) { allDistinct = false; break; }
      shiftedSet.add(v);
    }
    if (!allDistinct) continue;

    // β = sort(α + ρ) − ρ
    const aPlusRho = alpha.map((x, i) => x + rho[i]);
    aPlusRho.sort((a, b) => b - a);
    const beta = aPlusRho.map((x, i) => x - rho[i]);

    const j = lambda.reduce((a, b) => a + b, 0);
    const muSize = mu.reduce((a, b) => a + b, 0);
    results.push({ i: j - muSize, j, lambda, beta, dimension: schurDimension(beta) });
  }

  return results;
}

// =======================================================
// Memoized export
// =======================================================
const hodgeTwistedCache = new Map();

export function hodgeTwisted(k, n, t) {
  const cacheKey = `${k},${n},${t}`;
  if (hodgeTwistedCache.has(cacheKey)) return hodgeTwistedCache.get(cacheKey);
  const result = _computeHodgeTwisted(k, n, t);
  hodgeTwistedCache.set(cacheKey, result);
  return result;
}
