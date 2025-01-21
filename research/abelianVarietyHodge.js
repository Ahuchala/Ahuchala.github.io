
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

        // Construct rows for p + q = constant (total degree)
        for (let pPlusQ = 0; pPlusQ <= 2 * n; pPlusQ++) {
            const row = [];
            for (let p = 0; p <= pPlusQ; p++) {
                const q = pPlusQ - p;
                if (p <= n && q <= n) {
                    // h^{p,q} = binomial(n, p) * binomial(n, q)
                    row.push(binomial(n, p) * binomial(n, q));
                } else {
                    row.push(0); // Outside the valid range for Hodge numbers
                }
            }
            diamond.push(row);
        }

        return diamond;
    }

    /**
     * Display the Hodge diamond in a structured format
     */
    function displayHodgeDiamond(diamond) {
        const maxRowLength = diamond[diamond.length - 1].length;

        diamond.forEach((row, rowIndex) => {
            // Center-align the rows for display
            const spaces = " ".repeat(3 * (maxRowLength - row.length));
            const rowValues = row.map((val) => (val > 0 ? val : " ")).join("   ");
            console.log(spaces + rowValues);
        });
    }

    // Example Usage
    // const dimension = 3; // Change this value to compute for a different dimension
    // const hodgeDiamond = computeFullHodgeDiamond(dimension);
    return computeFullHodgeDiamond(nInput);
}
