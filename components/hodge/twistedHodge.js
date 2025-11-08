// =======================================================
// /components/hodge/twistedHodge.js
// =======================================================

// --- exact gcd on integers
function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

// --- exact integer Schur dimension
function schurDimension(beta) {
  const n = beta.length;
  const num = [];
  const den = [];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      num.push(beta[a] - beta[b] + (b - a));
      den.push(b - a);
    }
  }

  // pairwise gcd cancellations
  for (let i = 0; i < num.length; i++) {
    for (let j = 0; j < den.length; j++) {
      const g = gcd(num[i], den[j]);
      if (g > 1) {
        num[i] /= g;
        den[j] /= g;
      }
    }
  }

  const numProd = num.reduce((p, x) => p * x, 1);
  const denProd = den.reduce((p, x) => p * x, 1);
  return numProd / denProd; // exact integer
}

// --- t-skew: correct inverse μ ↦ λ (t-core)
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

// --- generate all (t−1)-bounded partitions in (t−1)×(n−k)
function* boundedPartitions(maxPart, maxLen) {
  yield []; // include empty partition
  function* rec(maxVal, len, prefix) {
    if (len >= maxLen) return;
    for (let next = Math.min(maxVal, maxPart); next > 0; next--) {
      const newPrefix = prefix.concat(next);
      yield newPrefix;
      yield* rec(next, len + 1, newPrefix);
    }
  }
  yield* rec(maxPart, 0, []);
}

// --- transpose of a partition
function transposePartition(lambda) {
  const w = Math.max(...lambda, 0);
  const tpose = [];
  for (let j = 0; j < w; j++) {
    tpose.push(lambda.filter(x => x > j).length);
  }
  return tpose;
}

// =======================================================
// Main export: enumerates valid t-core λ inside k×(n−k)
// =======================================================
export function hodgeTwisted(k, n, t) {
  const nMinusK = n - k;
  const results = [];
  const seen = new Set();

  for (const mu of boundedPartitions(t - 1, nMinusK)) {
    const lambda = tSkew(mu, t);

    // must fit in box k×(n−k)
    if (lambda.length > k || Math.max(0, ...lambda) > nMinusK) continue;

    const key = lambda.join(",");
    if (seen.has(key)) continue;
    seen.add(key);

    // α = (−rev(λᵀ), λ−t)
    const lamT = transposePartition(lambda);
    const left = Array(nMinusK).fill(0);
    const revLamT = [...lamT].reverse();
    for (let i = 0; i < Math.min(revLamT.length, nMinusK); i++) {
      left[nMinusK - revLamT.length + i] = -revLamT[i];
    }
    const right = [...lambda, ...Array(Math.max(0, k - lambda.length)).fill(0)].map(x => x - t);
    const alpha = [...left, ...right];

    // check distinctness of α+(n,…,1)
    const shift = Array.from({ length: n }, (_, i) => n - i);
    const shifted = alpha.map((x, i) => x + shift[i]);
    const distinct = new Set(shifted);
    if (distinct.size !== shifted.length) continue;

    // --- Correct β construction: sort(α+ρ) − ρ
    const rho = Array.from({ length: n }, (_, i) => n - i - 1); // (n−1,…,0)
    const alphaPlusRho = alpha.map((x, i) => x + rho[i]);
    const sorted = [...alphaPlusRho].sort((a, b) => b - a);
    const beta = sorted.map((x, i) => x - rho[i]);

    const dimension = schurDimension(beta);

    const j = lambda.reduce((a, b) => a + b, 0);
    const muSize = mu.reduce((a, b) => a + b, 0);
    const i = j - muSize; // t-interior size

    console.log(
      `λ=(${lambda.join(",") || "∅"})  i=${i}  j=${j}  β=[${beta.join(", ")}]  dim=${dimension}`
    );

    results.push({ i, j, lambda, beta, dimension });
  }

  console.log(`Found ${results.length} valid t-cores for (k=${k}, n=${n}, t=${t}).`);
  return results;
}
