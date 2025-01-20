/**
 * Compute Hodge numbers for a complete intersection in Gr(k, n)
 * given an array of degrees (dArray) using Schubert calculus.
 */

// I think this has a bad memory leak
export function hodgeGr(k, nInput, dArray) {
    // ============= HELPER: Compute Pieri Rule =============
    function pieriRule(sigma, degree, maxDegree) {
        const result = {};
        for (const [key, value] of Object.entries(sigma)) {
            const parts = key.split(',').map(Number);
            for (let i = 0; i <= degree; i++) {
                const newParts = [...parts, i].sort((a, b) => b - a);
                const newKey = newParts.join(',');
                if (newParts.reduce((a, b) => a + b, 0) <= maxDegree) {
                    result[newKey] = (result[newKey] || 0) + value;
                }
            }
        }
        return result;
    }

    // ============= HELPER: Schubert Multiplication =============
    function schubertMultiply(A, B, maxDegree) {
        const result = {};
        for (const [keyA, valueA] of Object.entries(A)) {
            for (const [keyB, valueB] of Object.entries(B)) {
                const partsA = keyA.split(',').map(Number);
                const partsB = keyB.split(',').map(Number);
                const combinedParts = [...partsA, ...partsB].sort((a, b) => b - a);
                const newKey = combinedParts.slice(0, k).join(',');
                if (combinedParts.reduce((a, b) => a + b, 0) <= maxDegree) {
                    result[newKey] = (result[newKey] || 0) + valueA * valueB;
                }
            }
        }
        return result;
    }

    // ============= HELPER: Initialize Schubert Ring =============
    function initializeSchubertRing(k, n) {
        const ring = {};
        ring[`sigma_0`] = { '0': 1 }; // Identity
        for (let i = 1; i <= k; i++) {
            ring[`sigma_${i}`] = { [i]: 1 }; // Schubert generators
        }
        return ring;
    }

    // ============= Numerator and Denominator Factors =============
    function numeratorFactorGr(k, d, maxDegree) {
        let sum = { '0': 1 };
        for (let i = 0; i < d; i++) {
            const partA = pieriRule({ '0': 1 }, d - 1 - i, maxDegree);
            const partB = pieriRule({ '0': 1 }, i, maxDegree);
            sum = schubertMultiply(sum, schubertMultiply(partA, partB, maxDegree), maxDegree);
        }
        return sum;
    }

    function denominatorFactorGr(k, d, maxDegree) {
        const bigSum = pieriRule({ '0': 1 }, d, maxDegree);
        let partial = { '0': 1 };
        for (let i = 0; i < d; i++) {
            const partA = pieriRule({ '0': 1 }, d - 1 - i, maxDegree);
            const partB = pieriRule({ '0': 1 }, i, maxDegree);
            partial = schubertMultiply(partial, schubertMultiply(partA, partB, maxDegree), maxDegree);
        }
        return schubertMultiply(bigSum, partial, maxDegree);
    }

    // ============= Polynomial Division (Schubert Classes) =============
    function schubertDivision(A, B, maxDegree) {
        const result = {};
        const b00 = B[`0`];
        if (!b00) {
            return result; // Can't divide if leading term is zero
        }
        for (const [key, value] of Object.entries(A)) {
            const parts = key.split(',').map(Number);
            const coeff = value / b00;
            const newKey = parts.join(',');
            result[newKey] = coeff;
        }
        return result;
    }

    // ============= Main Calculation =============
    const maxDegree = nInput - dArray.length + 2;
    const ring = initializeSchubertRing(k, nInput);

    // Build product: P = ∏_{d in dArray} ( Num_d / Den_d )
    let P = { '0': 1 }; // Initialize P as identity
    for (const di of dArray) {
        const Num_d = numeratorFactorGr(k, di, maxDegree);
        const Den_d = denominatorFactorGr(k, di, maxDegree);
        const factor = schubertDivision(Num_d, Den_d, maxDegree);
        P = schubertMultiply(P, factor, maxDegree);
    }

    // Compute Hodge numbers
    const hodgeNumbers = [];
    for (let i = 0; i <= maxDegree; i++) {
        const j = maxDegree - i;
        hodgeNumbers.push(P[`${i},${j}`] || 0);
    }

    return hodgeNumbers;
}
