import { test } from "node:test";
import assert from "node:assert/strict";

import { hodgeCompleteIntersection } from "../components/hodge/completeIntersectionHodgeNumbers.js";
import { chiCI, hodgeDiamondCI } from "../components/hodge/chiGrassmannianCI.js";
import { hodgeGrassmannian } from "../components/hodge/grassmannianHodge.js";
import { hodgeAbelianVariety } from "../components/hodge/abelianVarietyHodgeNumbers.js";
import { hodgeFlag } from "../components/hodge/flagHodge.js";
import { hodgeTwisted } from "../components/hodge/twistedHodge.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build a sparse Map "i,j" → total dimension from hodgeTwisted output.
 * i = cohomological degree, j = form degree. Only includes non-zero entries.
 */
function twistedMap(results) {
  const m = new Map();
  for (const { i, j, dimension } of results) {
    const key = `${i},${j}`;
    m.set(key, (m.get(key) ?? 0) + dimension);
  }
  for (const [k, v] of m) if (v === 0) m.delete(k);
  return m;
}

// ─── Complete intersections ──────────────────────────────────────────────────

// Plane curves: genus g = (d-1)(d-2)/2, middle row = [g, g]
test("CI: conic in P² (P¹, g=0)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2], 2), [0, 0]);
});

test("CI: cubic in P² (elliptic curve, g=1)", () => {
  assert.deepEqual(hodgeCompleteIntersection([3], 2), [1, 1]);
});

test("CI: quartic in P² (genus 3 curve)", () => {
  assert.deepEqual(hodgeCompleteIntersection([4], 2), [3, 3]);
});

test("CI: quintic in P² (genus 6 curve)", () => {
  assert.deepEqual(hodgeCompleteIntersection([5], 2), [6, 6]);
});

test("CI: sextic in P² (genus 10 curve)", () => {
  assert.deepEqual(hodgeCompleteIntersection([6], 2), [10, 10]);
});

// Surfaces in P^3 (dim = 3 - 1 = 2)
test("CI: quadric in P³ (P¹×P¹, h^{1,1}=2)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2], 3), [0, 2, 0]);
});

test("CI: cubic surface in P³ (del Pezzo 3, h^{1,1}=7)", () => {
  assert.deepEqual(hodgeCompleteIntersection([3], 3), [0, 7, 0]);
});

test("CI: quartic in P³ (K3 surface, K_X trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeCompleteIntersection([4], 3), [1, 20, 1]);
});

// Curves and surfaces via complete intersections in higher P^n
test("CI: hyperplane in P³ (≅ P², h^{1,1}=1)", () => {
  assert.deepEqual(hodgeCompleteIntersection([1], 3), [0, 1, 0]);
});

test("CI: two quadrics in P³ (elliptic curve, K_C trivial)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 2], 3), [1, 1]);
});

test("CI: quadric and cubic in P³ (genus 4 curve)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 3], 3), [4, 4]);
});

test("CI: two quadrics in P⁴ (del Pezzo degree 4, h^{1,1}=6)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 2], 4), [0, 6, 0]);
});

test("CI: quadric and cubic in P⁴ (K3, K_X = O(2+3-5) trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 3], 4), [1, 20, 1]);
});

test("CI: three quadrics in P⁵ (K3, K_X = O(6-6) trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 2, 2], 5), [1, 20, 1]);
});

// CY threefolds (K_X trivial, dim=3, middle row = [1, h^{2,1}, h^{2,1}, 1])
test("CI: quintic in P⁴ (CY3, h^{2,1}=101)", () => {
  assert.deepEqual(hodgeCompleteIntersection([5], 4), [1, 101, 101, 1]);
});

// ─── Grassmannians ──────────────────────────────────────────────────────────

test("Gr(1,2) = P¹: full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(1, 2), [
    [1],
    [0, 0],
    [1],
  ]);
});

test("Gr(1,3) = P²: full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(1, 3), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

test("Gr(1,5) = P⁴: full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(1, 5), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

test("Gr(2,4): full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(2, 4), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

test("Gr(2,5): full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(2, 5), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

// Gr(3,6): dim=9, q-binom [6 choose 3]_q = [1,1,2,3,3,3,3,2,1,1]
test("Gr(3,6): full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(3, 6), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

// Gr(k,n) ≅ Gr(n-k,n) symmetry
test("Gr(2,4) ≅ Gr(2,4): self-dual", () => {
  assert.deepEqual(hodgeGrassmannian(2, 4), hodgeGrassmannian(2, 4));
});

test("Gr(1,4) ≅ Gr(3,4): duality of Grassmannians", () => {
  assert.deepEqual(hodgeGrassmannian(1, 4), hodgeGrassmannian(3, 4));
});

// ─── Abelian varieties ───────────────────────────────────────────────────────

test("Abelian variety g=1 (elliptic curve): full Hodge diamond", () => {
  assert.deepEqual(hodgeAbelianVariety(1), [
    [1],
    [1, 1],
    [1],
  ]);
});

test("Abelian variety g=2 (abelian surface): full Hodge diamond", () => {
  assert.deepEqual(hodgeAbelianVariety(2), [
    [1],
    [2, 2],
    [1, 4, 1],
    [2, 2],
    [1],
  ]);
});

// h^{p,q} = C(3,p)·C(3,q) for g=3
test("Abelian variety g=3: full Hodge diamond", () => {
  assert.deepEqual(hodgeAbelianVariety(3), [
    [1],
    [3, 3],
    [3, 9, 3],
    [1, 9, 9, 1],
    [3, 9, 3],
    [3, 3],
    [1],
  ]);
});

// Verify the diamond is symmetric (h^{p,q} = h^{q,p})
test("Abelian variety g=2: diamond is symmetric", () => {
  const d = hodgeAbelianVariety(2);
  assert.equal(d[1][0], d[1][1]); // h^{0,1} = h^{1,0}
  assert.equal(d[2][0], d[2][2]); // h^{0,2} = h^{2,0}
});

// ─── Flag varieties ──────────────────────────────────────────────────────────

test("Flag [1,1] = P¹: full Hodge diamond", () => {
  assert.deepEqual(hodgeFlag([1, 1]), [
    [1],
    [0, 0],
    [1],
  ]);
});

test("Flag [1,1,1] = Fl(1,2,3): full Hodge diamond", () => {
  assert.deepEqual(hodgeFlag([1, 1, 1]), [
    [1],
    [0, 0],
    [0, 2, 0],
    [0, 0, 0, 0],
    [0, 2, 0],
    [0, 0],
    [1],
  ]);
});

// [1,1,1,1] = full flag in C^4, dim=6, q-multinomial [4]_q! = (1+q)(1+q+q²)(1+q+q²+q³)
// = [1,3,5,6,5,3,1]
test("Flag [1,1,1,1] = Fl(1,2,3,4): full Hodge diamond", () => {
  assert.deepEqual(hodgeFlag([1, 1, 1, 1]), [
    [1],
    [0, 0],
    [0, 3, 0],
    [0, 0, 0, 0],
    [0, 0, 5, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 5, 0, 0],
    [0, 0, 0, 0],
    [0, 3, 0],
    [0, 0],
    [1],
  ]);
});

// [3,1] = Gr(3,4) ≅ Gr(1,4) = P³
test("Flag [3,1] = Gr(3,4) ≅ P³: full Hodge diamond", () => {
  assert.deepEqual(hodgeFlag([3, 1]), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

// [2,2] = Gr(2,4) — flag and Grassmannian must agree
test("Flag [2,2] = Gr(2,4): full Hodge diamond matches Grassmannian", () => {
  assert.deepEqual(hodgeFlag([2, 2]), hodgeGrassmannian(2, 4));
});

// Multinomial symmetry: [1,2,1] and [2,1,1] have the same q-multinomial coefficient
test("Flag multinomial symmetry: [1,2,1] equals [2,1,1]", () => {
  assert.deepEqual(hodgeFlag([1, 2, 1]), hodgeFlag([2, 1, 1]));
});

// [1,2,1] in C^4, dim=5, poly = [1,2,3,3,2,1]
test("Flag [1,2,1]: full Hodge diamond", () => {
  assert.deepEqual(hodgeFlag([1, 2, 1]), [
    [1],
    [0, 0],
    [0, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 3, 0, 0],
    [0, 0, 0, 0],
    [0, 2, 0],
    [0, 0],
    [1],
  ]);
});

// ─── Twisted Hodge ───────────────────────────────────────────────────────────

// P¹ = Gr(1,2): H⁰(O(t)) = t+1 for t ≥ 0
test("Twisted k=1,n=2,t=1: H⁰(P¹,O(1))=2", () => {
  const m = twistedMap(hodgeTwisted(1, 2, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 2);
});

test("Twisted k=1,n=2,t=2: H⁰(P¹,O(2))=3, H⁰(Ω¹(2))=1", () => {
  const m = twistedMap(hodgeTwisted(1, 2, 2));
  assert.equal(m.size, 2);
  assert.equal(m.get("0,0"), 3);
  assert.equal(m.get("0,1"), 1);
});

// Serre duality on P¹: H^q(Ω^p(-t)) ≅ H^{1-q}(Ω^{1-p}(t))^*
// hodgeTwisted(1,2,-1) mirrors hodgeTwisted(1,2,1) at (N-i, N-j), N=1
test("Twisted k=1,n=2,t=-1: Serre dual of t=1", () => {
  const m = twistedMap(hodgeTwisted(1, 2, -1));
  assert.equal(m.size, 1);
  assert.equal(m.get("1,1"), 2);
});

// P² = Gr(1,3)
test("Twisted k=1,n=3,t=1: H⁰(P²,O(1))=3", () => {
  const m = twistedMap(hodgeTwisted(1, 3, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 3);
});

test("Twisted k=1,n=3,t=2: H⁰(P²,O(2))=6, H⁰(Ω¹(2))=3", () => {
  const m = twistedMap(hodgeTwisted(1, 3, 2));
  assert.equal(m.size, 2);
  assert.equal(m.get("0,0"), 6);
  assert.equal(m.get("0,1"), 3);
});

// Serre duality on P²: N=2
test("Twisted k=1,n=3,t=-1: Serre dual of t=1 on P²", () => {
  const m = twistedMap(hodgeTwisted(1, 3, -1));
  assert.equal(m.size, 1);
  assert.equal(m.get("2,2"), 3);
});

// P³ = Gr(1,4): H⁰(O(1)) = 4
test("Twisted k=1,n=4,t=1: H⁰(P³,O(1))=4", () => {
  const m = twistedMap(hodgeTwisted(1, 4, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 4);
});

// Gr(2,4) with O(1): Plücker embedding, H⁰=6
test("Twisted k=2,n=4,t=1: H⁰(Gr(2,4),O(1))=6 (Plücker)", () => {
  const m = twistedMap(hodgeTwisted(2, 4, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 6);
});

// Serre duality on Gr(2,4): N=4
test("Twisted k=2,n=4,t=-1: Serre dual of t=1 on Gr(2,4)", () => {
  const m = twistedMap(hodgeTwisted(2, 4, -1));
  assert.equal(m.size, 1);
  assert.equal(m.get("4,4"), 6);
});

// t=0: untwisted diamond must equal ordinary Hodge numbers
test("Twisted k=2,n=4,t=0: untwisted Gr(2,4) — diagonal only", () => {
  const m = twistedMap(hodgeTwisted(2, 4, 0));
  assert.equal(m.size, 5);
  assert.equal(m.get("0,0"), 1);
  assert.equal(m.get("1,1"), 1);
  assert.equal(m.get("2,2"), 2);
  assert.equal(m.get("3,3"), 1);
  assert.equal(m.get("4,4"), 1);
});

test("Twisted k=2,n=5,t=0: untwisted Gr(2,5) — diagonal only", () => {
  const m = twistedMap(hodgeTwisted(2, 5, 0));
  assert.equal(m.size, 7);
  assert.equal(m.get("0,0"), 1);
  assert.equal(m.get("1,1"), 1);
  assert.equal(m.get("2,2"), 2);
  assert.equal(m.get("3,3"), 2);
  assert.equal(m.get("4,4"), 2);
  assert.equal(m.get("5,5"), 1);
  assert.equal(m.get("6,6"), 1);
});

// ─── chiCI: Euler characteristics of CI in Grassmannian ──────────────────────

// Documented example from the algorithm description:
// Gr(2,5), degree-2 hypersurface, dim Z = 5
// χ(Ω^j_Z) = [1, -1, -8, 8, 1, -1]
test("chiCI Gr(2,5) d=[2]: documented example", () => {
  const chi = chiCI(2, 5, [2]);
  assert.deepEqual(chi.map(Math.round), [1, -1, -8, 8, 1, -1]);
});

// Gr(k,n) with no equations = the Grassmannian itself.
// χ(Ω^j_X) = (-1)^j * #{λ in k×m box : |λ|=j}
// For Gr(2,4): q-binom [4 choose 2]_q = [1,1,2,1,1], dim=4
test("chiCI Gr(2,4) d=[]: no equations = Grassmannian", () => {
  const chi = chiCI(2, 4, []);
  assert.deepEqual(chi.map(Math.round), [1, -1, 2, -1, 1]);
});

// Gr(2,5) no equations, q-binom [5 choose 2]_q = [1,1,2,2,2,1,1], dim=6
test("chiCI Gr(2,5) d=[]: no equations = Grassmannian", () => {
  const chi = chiCI(2, 5, []);
  assert.deepEqual(chi.map(Math.round), [1, -1, 2, -2, 2, -1, 1]);
});

// Lefschetz: for hypersurface in Gr(2,4), dim Z = 3.
// Euler characteristic of a smooth quadric in Gr(2,4).
// Hyperplane section of Gr(2,4) has dim = 4 - 1 = 3
test("chiCI Gr(2,4) d=[1]: hyperplane section, dim=3", () => {
  const chi = chiCI(2, 4, [1]);
  // dim=3 (odd), Serre duality: χ(Ω^j) = -χ(Ω^{3-j})
  assert.equal(chi.length, 4);
  assert.deepEqual(chi.map(Math.round), [1, -1, 1, -1]);
});

// Serre duality: χ(Ω^j_Z) = (-1)^{dim Z} χ(Ω^{dim-j}_Z) for untwisted CY (Σd = n)
// Gr(2,5), d=[5] would be CY (2+3=5), but let's check Serre duality on the documented example.
// For Gr(2,5) d=[2], dim=5 (odd), so χ(Ω^j) = -χ(Ω^{5-j}).
test("chiCI Gr(2,5) d=[2]: Serre duality χ(Ω^j) = -χ(Ω^{5-j})", () => {
  const chi = chiCI(2, 5, [2]);
  const dim = chi.length - 1;
  for (let j = 0; j <= dim; j++) {
    assert.equal(Math.round(chi[j]) + Math.round(chi[dim - j]), 0);
  }
});

// Gr(2,8), 4 hyperplanes: dim Z = 2*(8-2) - 4 = 8 (even).
// Middle row [0,0,0,1,22,1,0,0,0] — the "22" is h^{4,4} displayed as two digits,
// which is why the diamond row looks like "0001221000".
// Serre duality for even dim: χ(Ω^j) = χ(Ω^{8-j}).
test("chiCI Gr(2,8) d=[1,1,1,1]: 4 hyperplanes, dim=8", () => {
  const chi = chiCI(2, 8, [1, 1, 1, 1]);
  assert.equal(chi.length, 9);
  assert.deepEqual(chi.map(Math.round), [1, -1, 2, -3, 22, -3, 2, -1, 1]);
});

test("chiCI Gr(2,8) d=[1,1,1,1]: Serre duality χ(Ω^j) = χ(Ω^{8-j})", () => {
  const chi = chiCI(2, 8, [1, 1, 1, 1]);
  const dim = chi.length - 1;
  for (let j = 0; j <= dim; j++) {
    assert.equal(Math.round(chi[j]), Math.round(chi[dim - j]));
  }
});

// Gr(2,7), 7 hyperplanes: dim Z = 2*(7-2) - 7 = 3.
// Σd = 7 = n, so K_Z = 0: this is a Calabi-Yau 3-fold.
// χ(O_Z) = 0, h^{3,0} = 1, h^{2,1} = 50.
// The diamond listing all 16 Hodge numbers (1+2+3+4+3+2+1 per row) is:
// 1 | 0 0 | 0 1 0 | 1 50 50 1 | 0 1 0 | 0 0 | 1
test("chiCI Gr(2,7) d=[1×7]: CY3, h^{2,1}=50", () => {
  const chi = chiCI(2, 7, [1, 1, 1, 1, 1, 1, 1]);
  assert.equal(chi.length, 4);
  assert.deepEqual(chi.map(Math.round), [0, 49, -49, 0]);
});

test("chiCI Gr(2,7) d=[1×7]: Serre duality χ(Ω^j) = -χ(Ω^{3-j})", () => {
  const chi = chiCI(2, 7, [1, 1, 1, 1, 1, 1, 1]);
  const dim = chi.length - 1;
  for (let j = 0; j <= dim; j++) {
    assert.equal(Math.round(chi[j]) + Math.round(chi[dim - j]), 0);
  }
});

// ─── Hodge diamond checks ─────────────────────────────────────────────────────

// Gr(2,5), d=[2], dim=5 (odd).
// Primitive h^{3,2}=h^{2,3}=10; all other middle entries 0 (Grassmannian has
// no h^{p,p} for p+q=5 since 5 is odd).
test("hodgeDiamondCI Gr(2,5) d=[2]: full diamond", () => {
  assert.deepEqual(hodgeDiamondCI(2, 5, [2]), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 10, 10, 0, 0],  // middle: h^{2,3}=h^{3,2}=10
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

// Gr(2,7), d=[1×7], dim=3. CY3 with h^{3,0}=1, h^{2,1}=50.
test("hodgeDiamondCI Gr(2,7) d=[1×7]: full diamond", () => {
  assert.deepEqual(hodgeDiamondCI(2, 7, [1, 1, 1, 1, 1, 1, 1]), [
    [1],
    [0, 0],
    [0, 1, 0],
    [1, 50, 50, 1],  // middle: h^{0,3}=h^{3,0}=1, h^{1,2}=h^{2,1}=50
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});

// Gr(2,8), d=[1×4], dim=8 (even). h^{4,4}=22=19(prim)+3(Gr).
// Middle row "0001221000" = [0,0,0,1,22,1,0,0,0].
test("hodgeDiamondCI Gr(2,8) d=[1×4]: full diamond", () => {
  assert.deepEqual(hodgeDiamondCI(2, 8, [1, 1, 1, 1]), [
    [1],
    [0, 0],
    [0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 22, 1, 0, 0, 0],  // middle
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 0],
    [0, 0],
    [1],
  ]);
});
