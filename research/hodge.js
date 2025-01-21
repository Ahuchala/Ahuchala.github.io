
/**
 * Compute Hodge numbers for a complete intersection in P^n
 * given an array of degrees (dArray) using truncated
 * bivariate power-series expansions in x,y.
 *
 * We'll factor out (x-y) explicitly so we never divide
 * by a power series with zero constant term.
 */
export function hodge(dArray, nInput) {
    // ============= HELPER: binomial coefficient =============
    function binomial(n, k) {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let res = 1;
      for (let i = 1; i <= k; i++) {
        res = (res * (n - (k - i))) / i;
      }
      return res;
    }
  
    // ============= HELPER: polynomial in x,y =============
    function poly2d() {
      return {};
    }
    function polyGet(p, i, j) {
      const key = i + "," + j;
      return p[key] || 0;
    }
    function polySet(p, i, j, val) {
      const key = i + "," + j;
      if (Math.abs(val) < 1e-14) {
        delete p[key];
      } else {
        p[key] = val;
      }
    }
    function polyAdd(A, B, maxX, maxY) {
      const C = poly2d();
      const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
      for (const k of keys) {
        const [i, j] = k.split(",").map(Number);
        if (i <= maxX && j <= maxY) {
          const val = polyGet(A, i, j) + polyGet(B, i, j);
          polySet(C, i, j, val);
        }
      }
      return C;
    }
    function polySub(A, B, maxX, maxY) {
      const C = poly2d();
      const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
      for (const k of keys) {
        const [i, j] = k.split(",").map(Number);
        if (i <= maxX && j <= maxY) {
          const val = polyGet(A, i, j) - polyGet(B, i, j);
          polySet(C, i, j, val);
        }
      }
      return C;
    }
    function polyMul(A, B, maxX, maxY) {
      const C = poly2d();
      for (const kA of Object.keys(A)) {
        const [iA, jA] = kA.split(",").map(Number);
        const aVal = A[kA];
        for (const kB of Object.keys(B)) {
          const [iB, jB] = kB.split(",").map(Number);
          const i = iA + iB;
          const j = jA + jB;
          if (i <= maxX && j <= maxY) {
            const oldVal = polyGet(C, i, j);
            polySet(C, i, j, oldVal + aVal * B[kB]);
          }
        }
      }
      return C;
    }
  
    // ============= Build expansions (1+x)^d, (1+y)^d =============
    function expandOnePlusXtoD(d, maxX) {
      const p = poly2d();
      for (let k = 0; k <= d; k++) {
        if (k <= maxX) {
          polySet(p, k, 0, binomial(d, k));
        }
      }
      return p;
    }
    function expandOnePlusYtoD(d, maxY) {
      const p = poly2d();
      for (let k = 0; k <= d; k++) {
        if (k <= maxY) {
          polySet(p, 0, k, binomial(d, k));
        }
      }
      return p;
    }
  
    // ============= Factor (x-y) out of numerator and denominator =============
    // Numerator factor:  ( (1+x)^d - (1+y)^d ) / (x-y)
    // = sum_{k=0..d-1} (1+x)^{d-1-k} (1+y)^k
    function numeratorFactor(d, maxX, maxY) {
      let sum = poly2d();
      for (let k = 0; k < d; k++) {
        const px = expandOnePlusXtoD(d - 1 - k, maxX);
        const py = expandOnePlusYtoD(k, maxY);
        const prod = polyMul(px, py, maxX, maxY);
        sum = polyAdd(sum, prod, maxX, maxY);
      }
      return sum;
    }
  
    // Denominator factor:  ( x(1+y)^d - y(1+x)^d ) / (x-y )
    // = (1+y)^d - y * sum_{k=0..d-1} (1+x)^{d-1-k} (1+y)^k
    function denominatorFactor(d, maxX, maxY) {
      const bigSum = expandOnePlusYtoD(d, maxY);
      let partial = poly2d();
      for (let k = 0; k < d; k++) {
        const px = expandOnePlusXtoD(d - 1 - k, maxX);
        const py = expandOnePlusYtoD(k, maxY);
        const prod = polyMul(px, py, maxX, maxY);
        partial = polyAdd(partial, prod, maxX, maxY);
      }
      // multiply partial by y
      let yTimes = poly2d();
      for (const key of Object.keys(partial)) {
        const [i, j] = key.split(",").map(Number);
        const val = partial[key];
        if (j + 1 <= maxY) {
          polySet(yTimes, i, j + 1, polyGet(yTimes, i, j + 1) + val);
        }
      }
      return polySub(bigSum, yTimes, maxX, maxY);
    }
  
    // ============= Polynomial division A/B (truncated) =============
    function polyDiv(A, B, maxX, maxY) {
      // We assume B(0,0) != 0 so we can do a power-series style expansion
      const C = poly2d();
      const b00 = polyGet(B, 0, 0);
      if (Math.abs(b00) < 1e-14) {
        // can't invert
        return C;
      }
      // series expansion in ascending total degree
      for (let deg = 0; deg <= maxX + maxY; deg++) {
        for (let i = 0; i <= deg; i++) {
          const j = deg - i;
          if (i <= maxX && j <= maxY) {
            // sum_{u,v} B_{u,v} * C_{i-u,j-v} = A_{i,j}
            let bc_ij = 0;
            for (const kb of Object.keys(B)) {
              const [u, v] = kb.split(",").map(Number);
              if (u <= i && v <= j) {
                bc_ij += B[kb] * polyGet(C, i - u, j - v);
              }
            }
            const needed = polyGet(A, i, j) - bc_ij;
            const oldCij = polyGet(C, i, j);
            const newCij = oldCij + needed / b00;
            polySet(C, i, j, newCij);
          }
        }
      }
      return C;
    }
  
    // ============= Actual formula: =============
    // dimension of intersection = n - dArray.length
    let n = nInput - dArray.length;
    // We'll expand series up to some degree ~ n+2
    const maxDeg = n + 2;
  
    // Build product:  P = ∏_{d in dArray} ( Num_d / Den_d )
    let P = poly2d();
    polySet(P, 0, 0, 1); // P = 1
    for (const di of dArray) {
      const Num_d = numeratorFactor(di, maxDeg, maxDeg);
      const Den_d = denominatorFactor(di, maxDeg, maxDeg);
      const factor = polyDiv(Num_d, Den_d, maxDeg, maxDeg);
      P = polyMul(P, factor, maxDeg, maxDeg);
    }
  
    // mainTerm = [P - 1] * [1/((1+x)(1+y))]
    // Then H = mainTerm + 1/(1 - x*y)
    // We'll do partial expansions for each factor.
    function oneOver1plusX(maxX) {
      // 1/(1+x) = 1 - x + x^2 - x^3 + ...
      const r = poly2d();
      let sign = 1;
      for (let i = 0; i <= maxX; i++) {
        polySet(r, i, 0, sign);
        sign = -sign;
      }
      return r;
    }
    function oneOver1plusY(maxY) {
      const r = poly2d();
      let sign = 1;
      for (let j = 0; j <= maxY; j++) {
        polySet(r, 0, j, sign);
        sign = -sign;
      }
      return r;
    }
  
    const one = poly2d();
    polySet(one, 0, 0, 1);
    let Pminus1 = polySub(P, one, maxDeg, maxDeg);
  
    // 1/((1+x)(1+y)) = (1/(1+x)) * (1/(1+y))
    let inv1px = oneOver1plusX(maxDeg);
    let inv1py = oneOver1plusY(maxDeg);
    let inv1pxy = polyMul(inv1px, inv1py, maxDeg, maxDeg);
  
    let mainTerm = polyMul(Pminus1, inv1pxy, maxDeg, maxDeg);
  
    // 1/(1 - x*y) = sum_{k=0 to maxDeg} (x*y)^k
    let inv1mxy = poly2d();
    for (let k = 0; k <= maxDeg; k++) {
      polySet(inv1mxy, k, k, 1 + polyGet(inv1mxy, k, k));
    }
  
    let Hpoly = polyAdd(mainTerm, inv1mxy, maxDeg, maxDeg);
  
    // Finally extract the coefficients h^(i,n-i) for i=0..(n).
    // We'll store them in an array of length n+1
    let result = [];
    for (let i = 0; i <= n; i++) {
      const j = n - i;
      const coeff = polyGet(Hpoly, i, j);
      // Round near-integer
      result.push(Math.round(coeff));
    }
  
    return result;
  }
  