
export function hodgeAbelianVariety(nInput) {
    function binomial(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        let res = 1;
        if (k > n-k) {
          k = n-k;
        }
        for (let i = 1; i <= k; i++) {
          res = (res * (n - (k - i))) / i;
        }
        return res;
      }

    /**
     * Compute the full Hodge diamond for an abelian variety of dimension n
     */
    function computeFullHodgeDiamond(n) {
        const diamond = [];
        const totalRows = 2 * n + 1;

        // Construct rows for 0 to n (upper half and middle row)
        for (let i = 0; i <= n; i++) {
            const row = [];
            for (let j = 0; j <= i; j++) {
                const hodgeNumber = binomial(n, j) * binomial(n, i - j);
                row.push(hodgeNumber);
            }
            diamond.push(row);
        }

        // Construct rows for n+1 to 2n (lower half)
        for (let i = n + 1; i < totalRows; i++) {
            // Mirror rows symmetrically from the top
            const mirroredRow = diamond[totalRows - 1 - i];
            diamond.push([...mirroredRow]);
        }

        return diamond;
    }

    return computeFullHodgeDiamond(nInput);
}
