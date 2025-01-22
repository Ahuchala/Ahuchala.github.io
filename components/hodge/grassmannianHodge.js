/**
 * Return the Hodge diamond for Gr(k,n), a complex Grassmannian
 * of dimension dim = k*(n-k). The result is a 2D array "diamond"
 * of length 2*dim + 1 in rows. Row i has:
 *   - size = i+1, if i <= dim
 *   - size = 2*dim - i + 1, if i > dim
 *
 * Only diagonal entries h^{p,p} might be non-zero, with p = i/2
 * in row i. The value is the coefficient of q^p in (n choose k)_q,
 * i.e. the number of partitions of size p fitting in a (k x (n-k)) box.
 */
export function hodgeGrassmannian(k, n) {
    // dimension of Gr(k,n)
    const dim = k * (n - k);
    // q-binomial polynomial \binom{n}{k}_q as an array of coefficients
    const qbin = qBinomialCoeffs(n, k); // length up to n*k + 1
  
    // We'll build an array "diamond" of length 2*dim + 1:
    const totalRows = 2 * dim + 1;
    const diamond = [];
  
    for (let i = 0; i < totalRows; i++) {
      // Row size:
      //   if i<=dim => i+1
      //   else => 2*dim - i + 1
      const rowSize = (i <= dim) ? (i + 1) : (2*dim - i + 1);
  
      // In the standard h^{p,q} diamond, row i corresponds to p+q = i,
      // so p ranges from max(0,i-dim) to min(i,dim).
      const pMin = Math.max(0, i - dim);
      const pMax = Math.min(i, dim);
  
      // Initialize the row
      const row = new Array(rowSize).fill(0);
  
      // Only if i=2*p is even do we place a non-zero on the diagonal
      // i.e. p = i/2 in the range [pMin, pMax].
      if (i % 2 === 0) {
        const p = i / 2;
        if (p >= pMin && p <= pMax) {
          // The column index in this row is (p - pMin).
          // Then h^{p,p} = coefficient of q^p in (n choose k)_q.
          const colIndex = p - pMin;
          row[colIndex] = qbin[p] || 0;
        }
      }
  
      diamond.push(row);
    }
  
    return diamond;
  }
  
  /**
   * qBinomialCoeffs(n, k):
   * ----------------------
   * Return an array "coeffs" where coeffs[p] is the coefficient of q^p
   * in the q-binomial coefficient (n choose k)_q.
   *
   * Implementation: dynamic programming using
   *   \binom{x}{j}_q = \binom{x-1}{j-1}_q + q^j * \binom{x-1}{j}_q
   *
   * The length needed is up to n*k + 1, since the largest exponent is k(n-k).
   */
  function qBinomialCoeffs(n, k) {
    if (k < 0 || k > n) return [0];
    if (k === 0 || k === n) return [1];
  
    // We'll build a 2D array C[x][j], each is an array "poly" for the polynomial
    // representing \binom{x}{j}_q. poly[r] = coefficient of q^r.
    const C = [];
    for (let x = 0; x <= n; x++) {
      C[x] = [];
      for (let j = 0; j <= Math.min(k, x); j++) {
        // each is an array of length up to n*k+1
        C[x][j] = new Array(n*k + 1).fill(0);
      }
    }
  
    // Base cases
    // \binom{x}{0}_q = 1, \binom{x}{x}_q = 1
    for (let x = 0; x <= n; x++) {
      C[x][0][0] = 1;
      if (x <= k) {
        C[x][x][0] = 1;
      }
    }
  
    // Fill in DP for x=1..n
    for (let x = 1; x <= n; x++) {
      for (let j = 1; j < x && j <= k; j++) {
        const polyA = C[x-1][j-1]; // \binom{x-1}{j-1}_q
        const polyB = C[x-1][j];   // \binom{x-1}{j}_q
        const result = polyA.slice();
  
        // add q^j * polyB
        for (let r = 0; r < result.length - j; r++) {
          result[r + j] += polyB[r];
        }
        C[x][j] = result;
      }
    }
  
    // \binom{n}{k}_q is in C[n][k]
    return C[n][k];
  }
  