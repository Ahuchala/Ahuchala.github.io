/**
 * Return the Hodge diamond for the partial flag variety corresponding to a flag type given by dims.
 * Interpret dims = [d1, d2, …, dk] as specifying a flag
 *    V_{m1} ⊂ V_{m2} ⊂ … ⊂ V_{mk} ⊂ ℂ^n,
 * where m_i = d1 + ⋯ + d_i and n = m_k.
 * Its complex dimension is
 *    dim F = Σ_{i=1}^k (n - m_i)(m_i - m_{i-1}),
 * with m₀ = 0.
 *
 * The cohomology is pure and only diagonal Hodge numbers h^{p,p} may be nonzero;
 * these are given by the coefficients of q^p in the q-multinomial coefficient
 *
 *      [ n; d1, d2, …, dk ]_q = (q)_n / ((q)_{d1} (q)_{d2} … (q)_{dk}).
 *
 * The Hodge diamond is returned as a 2D array of length 2*(dimF)+1.
 * Row i (with 0 ≤ i ≤ 2*dimF) has:
 *   - if i ≤ dimF, i+1 entries,
 *   - if i > dimF, 2*dimF - i + 1 entries.
 * In row i, if i is even (say i=2p), the “diagonal” entry (taken as the middle entry)
 * is set to the coefficient of q^p in the above q-multinomial; all other entries are 0.
 */
export function hodgeFlag(dims) {
    // Compute ambient dimension n.
    const n = dims.reduce((a, b) => a + b, 0);
    // Compute complex dimension of F:
    let dimF = 0;
    let m_prev = 0;
    for (let i = 0; i < dims.length; i++) {
      const m_i = m_prev + dims[i];
      dimF += (n - m_i) * (m_i - m_prev);
      m_prev = m_i;
    }
    
    const totalRows = 2 * dimF + 1;
    
    // Compute the q-multinomial coefficients.
    const poly = qMultinomialCoeffs(dims); // poly[p] is coefficient of q^p.
    
    // Build the diamond.
    const diamond = [];
    for (let i = 0; i < totalRows; i++) {
      const rowSize = (i <= dimF) ? (i + 1) : (totalRows - i);
      const row = new Array(rowSize).fill(0);
      // Only for even-indexed rows, set the middle entry.
      if (i % 2 === 0) {
        const p = i / 2;
        const mid = Math.floor(rowSize / 2);
        row[mid] = poly[p] || 0;
      }
      diamond.push(row);
    }
    
    return diamond;
  }
  
  /**
   * Compute the q-multinomial coefficient [n; d1, d2, …, dk]_q as an array of coefficients.
   * This uses the identity:
   *   [n; d1, d2, …, dk]_q = [n choose d1]_q · [n-d1 choose d2]_q · … · [n - (d1+…+d_{k-1}) choose d_k]_q.
   */
  function qMultinomialCoeffs(dims) {
    const total = dims.reduce((a, b) => a + b, 0);
    let poly = [1];
    let remaining = total;
    for (let i = 0; i < dims.length; i++) {
      const r = dims[i];
      const qbin = qBinomialCoeffs(remaining, r); // polynomial for [remaining choose r]_q.
      poly = polyMultiply(poly, qbin);
      remaining -= r;
    }
    return poly;
  }
  
  /**
   * Multiply two polynomials represented as arrays of coefficients.
   * (polyMultiply(a, b))[k] = Σ_{i+j=k} a[i]*b[j].
   */
  function polyMultiply(a, b) {
    const res = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        res[i + j] += a[i] * b[j];
      }
    }
    return res;
  }
  
  /**
   * qBinomialCoeffs(n, k):
   * Return an array "coeffs" where coeffs[p] is the coefficient of q^p in the q-binomial coefficient
   *   [n choose k]_q.
   * Implemented via dynamic programming.
   */
  function qBinomialCoeffs(n, k) {
    if (k < 0 || k > n) return [0];
    if (k === 0 || k === n) return [1];
    
    const C = [];
    for (let x = 0; x <= n; x++) {
      C[x] = [];
      for (let j = 0; j <= Math.min(k, x); j++) {
        C[x][j] = new Array(n * k + 1).fill(0);
      }
    }
    
    for (let x = 0; x <= n; x++) {
      C[x][0][0] = 1;
      if (x <= k) {
        C[x][x][0] = 1;
      }
    }
    
    for (let x = 1; x <= n; x++) {
      for (let j = 1; j < x && j <= k; j++) {
        const polyA = C[x - 1][j - 1];
        const polyB = C[x - 1][j];
        const result = polyA.slice();
        for (let r = 0; r < polyB.length - j; r++) {
          result[r + j] += polyB[r];
        }
        C[x][j] = result;
      }
    }
    
    return C[n][k];
  }
  