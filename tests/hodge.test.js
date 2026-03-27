import { test } from "node:test";
import assert from "node:assert/strict";

import { chiCI, hodgeDiamondCI, hodgePrimitiveMiddleRow, applyBlowUp } from "../components/hodge/chiGrassmannianCI.js";
import { hodgeDiamondProduct } from "../components/hodge/chiProductCI.js";
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
  assert.deepEqual(hodgeDiamondCI(1, 3, [2])[1], [0, 0]);
});

test("CI: cubic in P² (elliptic curve, g=1)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 3, [3])[1], [1, 1]);
});

test("CI: quartic in P² (genus 3 curve)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 3, [4])[1], [3, 3]);
});

test("CI: quintic in P² (genus 6 curve)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 3, [5])[1], [6, 6]);
});

test("CI: sextic in P² (genus 10 curve)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 3, [6])[1], [10, 10]);
});

// Surfaces in P^3 (dim = 3 - 1 = 2)
test("CI: quadric in P³ (P¹×P¹, h^{1,1}=2)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [2])[2], [0, 2, 0]);
});

test("CI: cubic surface in P³ (del Pezzo 3, h^{1,1}=7)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [3])[2], [0, 7, 0]);
});

test("CI: quartic in P³ (K3 surface, K_X trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [4])[2], [1, 20, 1]);
});

// Curves and surfaces via complete intersections in higher P^n
test("CI: hyperplane in P³ (≅ P², h^{1,1}=1)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [1])[2], [0, 1, 0]);
});

test("CI: two quadrics in P³ (elliptic curve, K_C trivial)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [2, 2])[1], [1, 1]);
});

test("CI: quadric and cubic in P³ (genus 4 curve)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 4, [2, 3])[1], [4, 4]);
});

test("CI: two quadrics in P⁴ (del Pezzo degree 4, h^{1,1}=6)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 5, [2, 2])[2], [0, 6, 0]);
});

test("CI: quadric and cubic in P⁴ (K3, K_X = O(2+3-5) trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 5, [2, 3])[2], [1, 20, 1]);
});

test("CI: three quadrics in P⁵ (K3, K_X = O(6-6) trivial, h^{1,1}=20)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 6, [2, 2, 2])[2], [1, 20, 1]);
});

// CY threefolds (K_X trivial, dim=3, middle row = [1, h^{2,1}, h^{2,1}, 1])
test("CI: quintic in P⁴ (CY3, h^{2,1}=101)", () => {
  assert.deepEqual(hodgeDiamondCI(1, 5, [5])[3], [1, 101, 101, 1]);
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

// ─── Regression: primitive middle-row for all JSON entries (d=2) ────────────

test("hodgePrimitiveMiddleRow Gr(2,10) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 10, [2]), [0,0,0,0,1,725,27621,150425]);
});

test("hodgePrimitiveMiddleRow Gr(2,10) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 10, [2,2]), [0,0,0,4,3719,198864,1775059,3588784]);
});

test("hodgePrimitiveMiddleRow Gr(2,11) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 11, [2]), [0,0,0,0,0,55,11022,251174,1103641]);
});

test("hodgePrimitiveMiddleRow Gr(2,12) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 12, [2]), [0,0,0,0,0,1,1572,142286,2215576,8248019]);
});

test("hodgePrimitiveMiddleRow Gr(2,13) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 13, [2]), [0,0,0,0,0,0,78,32123,1655173,19188143,62600473]);
});

test("hodgePrimitiveMiddleRow Gr(2,14) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 14, [2]), [0,0,0,0,0,0,1,2989,533975,17948399,164332155,481415739]);
});

test("hodgePrimitiveMiddleRow Gr(2,4) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 4, [2]), [0,2]);
});

test("hodgePrimitiveMiddleRow Gr(2,4) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 4, [2,2]), [1,19]);
});

test("hodgePrimitiveMiddleRow Gr(2,4) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 4, [2,2,2]), [17]);
});

test("hodgePrimitiveMiddleRow Gr(2,5) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 5, [2]), [0,0,10]);
});

test("hodgePrimitiveMiddleRow Gr(2,5) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 5, [2,2]), [0,20,130]);
});

test("hodgePrimitiveMiddleRow Gr(2,5) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 5, [2,2,2]), [10,260]);
});

test("hodgePrimitiveMiddleRow Gr(2,5) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 5, [2,2,2,2]), [135,639]);
});

test("hodgePrimitiveMiddleRow Gr(2,5) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 5, [2,2,2,2,2]), [401]);
});

test("hodgePrimitiveMiddleRow Gr(2,6) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 6, [2]), [0,0,1,69]);
});

test("hodgePrimitiveMiddleRow Gr(2,6) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 6, [2,2]), [0,2,239,956]);
});

test("hodgePrimitiveMiddleRow Gr(2,6) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 6, [2,2,2]), [1,271,2972]);
});

test("hodgePrimitiveMiddleRow Gr(2,6) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 6, [2,2,2,2]), [101,3335,9858]);
});

test("hodgePrimitiveMiddleRow Gr(2,6) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 6, [2,2,2,2,2]), [1249,11969]);
});

test("hodgePrimitiveMiddleRow Gr(2,7) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 7, [2]), [0,0,0,21,441]);
});

test("hodgePrimitiveMiddleRow Gr(2,7) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 7, [2,2]), [0,0,63,2380,7231]);
});

test("hodgePrimitiveMiddleRow Gr(2,7) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 7, [2,2,2]), [0,63,4501,31038]);
});

test("hodgePrimitiveMiddleRow Gr(2,7) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 7, [2,2,2,2]), [21,3633,54824,130122]);
});

test("hodgePrimitiveMiddleRow Gr(2,7) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 7, [2,2,2,2,2]), [1071,43239,234718]);
});

test("hodgePrimitiveMiddleRow Gr(2,8) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 8, [2]), [0,0,0,1,273,3002]);
});

test("hodgePrimitiveMiddleRow Gr(2,8) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 8, [2,2]), [0,0,3,1148,22219,56295]);
});

test("hodgePrimitiveMiddleRow Gr(2,8) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 8, [2,2,2]), [0,3,1809,60507,309210]);
});

test("hodgePrimitiveMiddleRow Gr(2,8) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 8, [2,2,2,2]), [1,1265,78222,756316,1570297]);
});

test("hodgePrimitiveMiddleRow Gr(2,8) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 8, [2,2,2,2,2]), [331,48791,931620,3771648]);
});

test("hodgePrimitiveMiddleRow Gr(2,9) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 9, [2]), [0,0,0,0,36,2880,20952]);
});

test("hodgePrimitiveMiddleRow Gr(2,9) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(2, 9, [2,2]), [0,0,0,144,16209,200340,446202]);
});

test("hodgePrimitiveMiddleRow Gr(3,10) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 10, [2]), [0,0,0,0,1,4850,1226841,57797421,763665001,3398571946,5543786962]);
});

test("hodgePrimitiveMiddleRow Gr(3,10) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 10, [2,2]), [0,0,0,4,24344,7652574,457801608,7995063098,49675865063,121231109407]);
});

test("hodgePrimitiveMiddleRow Gr(3,11) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 11, [2]), [0,0,0,0,0,165,243650,43475861,1911635286,27840771134,155879394353,362637067727]);
});

test("hodgePrimitiveMiddleRow Gr(3,12) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 12, [2]), [0,0,0,0,0,1,15586,11514646,1601905591,66936501489,1051905193847,7034370013956,21471612746883,31028653969169]);
});

test("hodgePrimitiveMiddleRow Gr(3,13) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 13, [2]), [0,0,0,0,0,0,286,1145872,529337458,61071480379,2453912110897,40997316116146,316014868920869,1196863914843831,2309782401722966]);
});

test("hodgePrimitiveMiddleRow Gr(3,14) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 14, [2]), [0,0,0,0,0,0,1,41209,73452275,24058474882,2398361382404,93425215477581,1641501328374714,14216994691374188,64220895877358660,156695737401401300,210521385209475520]);
});

test("hodgePrimitiveMiddleRow Gr(3,6) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 6, [2]), [0,0,1,140,601]);
});

test("hodgePrimitiveMiddleRow Gr(3,6) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 6, [2,2]), [0,2,449,4524]);
});

test("hodgePrimitiveMiddleRow Gr(3,6) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 6, [2,2,2]), [1,481,10532,27881]);
});

test("hodgePrimitiveMiddleRow Gr(3,6) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 6, [2,2,2,2]), [171,9859,62358]);
});

test("hodgePrimitiveMiddleRow Gr(3,6) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 6, [2,2,2,2,2]), [3251,58351,142902]);
});

test("hodgePrimitiveMiddleRow Gr(3,7) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 7, [2]), [0,0,0,35,2758,20076]);
});

test("hodgePrimitiveMiddleRow Gr(3,7) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 7, [2,2]), [0,0,105,12215,154672,347542]);
});

test("hodgePrimitiveMiddleRow Gr(3,7) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 7, [2,2,2]), [0,105,20097,435792,1864577]);
});

test("hodgePrimitiveMiddleRow Gr(3,7) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 7, [2,2,2,2]), [35,14581,580104,4534319,8817808]);
});

test("hodgePrimitiveMiddleRow Gr(3,7) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 7, [2,2,2,2,2]), [3941,371161,5592210,20334007]);
});

test("hodgePrimitiveMiddleRow Gr(3,8) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 8, [2]), [0,0,0,1,1112,67305,650553,1351504]);
});

test("hodgePrimitiveMiddleRow Gr(3,8) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 8, [2,2]), [0,0,3,4507,376955,5516118,19868743]);
});

test("hodgePrimitiveMiddleRow Gr(3,8) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 8, [2,2,2]), [0,3,6849,836418,18477228,107314782,190247626]);
});

test("hodgePrimitiveMiddleRow Gr(3,8) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 8, [2,2,2,2]), [1,4625,920574,31787647,291964616,854014201]);
});

test("hodgePrimitiveMiddleRow Gr(3,8) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 8, [2,2,2,2,2]), [1171,503189,29902458,445124149,2101910092,3491437727]);
});

test("hodgePrimitiveMiddleRow Gr(3,9) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 9, [2]), [0,0,0,0,84,36150,1879449,21813090,71136917]);
});

test("hodgePrimitiveMiddleRow Gr(3,9) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(3, 9, [2,2]), [0,0,0,336,185676,12710817,205842258,1017039061,1713732500]);
});

test("hodgePrimitiveMiddleRow Gr(4,10) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 10, [2]), [0,0,0,0,1,13760,8343621,926258586,30239408012,363045824691,1806323956328,3972028010137]);
});

test("hodgePrimitiveMiddleRow Gr(4,10) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 10, [2,2]), [0,0,0,4,68894,50960454,6902720253,279057249922,4252756943182,27761857459621,83459171464965,119982081028834]);
});

test("hodgePrimitiveMiddleRow Gr(4,8) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 8, [2]), [0,0,0,1,1700,155422,2423049,9017875]);
});

test("hodgePrimitiveMiddleRow Gr(4,8) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 8, [2,2]), [0,0,3,6859,842316,18696542,108857786,193117765]);
});

test("hodgePrimitiveMiddleRow Gr(4,8) 3×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 8, [2,2,2]), [0,3,10377,1816698,58277529,512676368,1469416681]);
});

test("hodgePrimitiveMiddleRow Gr(4,8) 4×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 8, [2,2,2,2]), [1,6977,1950414,94634503,1258024985,5595719279,9121149593]);
});

test("hodgePrimitiveMiddleRow Gr(4,8) 5×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 8, [2,2,2,2,2]), [1759,1042889,84858042,1767224521,12145903889,31058618581]);
});

test("hodgePrimitiveMiddleRow Gr(4,9) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 9, [2]), [0,0,0,0,126,107982,11025828,267058044,2017356121,5399830296]);
});

test("hodgePrimitiveMiddleRow Gr(4,9) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(4, 9, [2,2]), [0,0,0,504,547596,70913664,2238368220,23043321323,89214590555,139126255901]);
});

test("hodgePrimitiveMiddleRow Gr(5,10) 1×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(5, 10, [2]), [0,0,0,0,1,19304,15388263,2206230708,93286270462,1471833677292,9849790919188,30057566343211,43427888504570]);
});

test("hodgePrimitiveMiddleRow Gr(5,10) 2×d=2: regression", () => {
  assert.deepEqual(hodgePrimitiveMiddleRow(5, 10, [2,2]), [0,0,0,4,96614,93619752,16246652763,839591628326,16498708108916,141169515777511,569276046290679,1131550540047461]);
});

// ─── Product Grassmannian CI (hodgeDiamondProduct) ───────────────────────────

// P¹×P¹ with no CI (r=0): product Hodge diamond.
// h^{1,1}(P¹×P¹) = 2 (two independent (1,1)-classes).
test("hodgeDiamondProduct P¹×P¹ (r=0): full diamond", () => {
  assert.deepEqual(hodgeDiamondProduct([{k:1,n:2},{k:1,n:2}], []), [
    [1],
    [0, 0],
    [0, 2, 0],
    [0, 0],
    [1],
  ]);
});

// Bidegree (2,2) CI in P¹×P¹: elliptic curve (g=1).
test("hodgeDiamondProduct (2,2) CI in P¹×P¹: elliptic curve", () => {
  assert.deepEqual(hodgeDiamondProduct([{k:1,n:2},{k:1,n:2}], [[2, 2]]), [
    [1],
    [1, 1],
    [1],
  ]);
});

// Bidegree (2,3) CI in P¹×P²: K3 surface (h^{1,1}=20).
test("hodgeDiamondProduct (2,3) CI in P¹×P²: K3 surface (h^{1,1}=20)", () => {
  const d = hodgeDiamondProduct([{k:1,n:2},{k:1,n:3}], [[2, 3]]);
  assert.deepEqual(d[Math.floor(d.length / 2)], [1, 20, 1]);
});

// Two (1,1) CIs in P¹×P¹: 0-dimensional, degree = 2.
test("hodgeDiamondProduct two (1,1) CIs in P¹×P¹: 2 points", () => {
  assert.deepEqual(hodgeDiamondProduct([{k:1,n:2},{k:1,n:2}], [[1, 1], [1, 1]]), [[2]]);
});

// P¹×P¹×P¹ (r=0, dim=3): h^{p,p} = C(3,p); all off-diagonal entries 0.
test("hodgeDiamondProduct P¹×P¹×P¹ (r=0): diagonal Hodge numbers", () => {
  const d = hodgeDiamondProduct([{k:1,n:2},{k:1,n:2},{k:1,n:2}], []);
  assert.deepEqual(d[0], [1]);
  assert.deepEqual(d[2], [0, 3, 0]);
  assert.deepEqual(d[3], [0, 0, 0, 0]); // middle row: purely off-diagonal = 0
  assert.deepEqual(d[4], [0, 3, 0]);
  assert.deepEqual(d[6], [1]);
});


// ─── applyBlowUp ─────────────────────────────────────────────────────────────

// s=0: identity (deep copy, no change)
test("applyBlowUp: s=0 is identity", () => {
  const d = hodgeDiamondCI(1, 4, [4]); // K3
  assert.deepEqual(applyBlowUp(d, 0, 2), d);
});

// dim=0: no intermediate diagonal, unchanged
test("applyBlowUp: dim=0 unchanged", () => {
  const d = hodgeDiamondCI(1, 3, [2, 2]); // two conics in P², dim=0
  assert.deepEqual(applyBlowUp(d, 5, 0), d);
});

// dim=1 (elliptic curve): no intermediate diagonal entries, unchanged
test("applyBlowUp: dim=1 (elliptic curve), s=5 → unchanged", () => {
  const d = hodgeDiamondCI(1, 3, [3]); // elliptic curve
  assert.deepEqual(applyBlowUp(d, 5, 1), d);
});

// dim=2, K3 quartic: h^{1,1}=20, blow-up at 1 point → h^{1,1}=21
// Middle row is at index 2; h^{1,1} is at column min(1,2-1)=1 → row 2, col 1
test("applyBlowUp: K3 quartic s=1 → h^{1,1}=21", () => {
  const d = hodgeDiamondCI(1, 4, [4]); // dim=2, middle row [1,20,1]
  const blown = applyBlowUp(d, 1, 2);
  assert.equal(blown[2][1], 21); // h^{1,1} in middle row (p=1, colJ=min(1,1)=1)
  assert.equal(blown[0][0], 1);  // h^{0,0} unchanged
  assert.equal(blown[4][0], 1);  // h^{2,2} unchanged
});

// dim=2, cubic surface: h^{1,1}=7, blow-up at 3 points → h^{1,1}=10
test("applyBlowUp: cubic surface s=3 → h^{1,1}=10", () => {
  const d = hodgeDiamondCI(1, 4, [3]); // dim=2, middle row [0,7,0]
  const blown = applyBlowUp(d, 3, 2);
  assert.equal(blown[2][1], 10);
});

// dim=3, CY3 quintic: h^{1,1}=1, h^{2,2}=1; blow-up at 2 points → both become 3
// p=1: rowIdx=2, colJ=min(1,2)=1 → row 2, col 1
// p=2: rowIdx=4, colJ=min(2,1)=1 → row 4, col 1
test("applyBlowUp: CY3 quintic s=2 → h^{1,1}=3, h^{2,2}=3", () => {
  const d = hodgeDiamondCI(1, 5, [5]); // dim=3
  const blown = applyBlowUp(d, 2, 3);
  assert.equal(blown[2][1], 3); // h^{1,1}: row 2, col min(1,2)=1
  assert.equal(blown[4][1], 3); // h^{2,2}: row 4, col min(2,1)=1
  assert.equal(blown[0][0], 1); // h^{0,0} unchanged
  assert.equal(blown[6][0], 1); // h^{3,3} unchanged
  assert.deepEqual(blown[3], d[3]); // middle row unchanged
});

// dim=4: p=1,2,3 get +s; colJ=min(p,4-p)
// p=1: row 2, col 1; p=2: row 4, col 2 (middle row!); p=3: row 6, col 1
test("applyBlowUp: dim=4 CI, s=1 → correct column placement", () => {
  const d = hodgeDiamondCI(1, 6, [3]); // cubic in P^5, dim=4
  const blown = applyBlowUp(d, 1, 4);
  assert.equal(blown[2][1], d[2][1] + 1); // p=1: col=min(1,3)=1
  assert.equal(blown[4][2], d[4][2] + 1); // p=2: middle row, col=min(2,2)=2
  assert.equal(blown[6][1], d[6][1] + 1); // p=3: col=min(3,1)=1
  assert.equal(blown[0][0], d[0][0]);      // corners unchanged
  assert.equal(blown[8][0], d[8][0]);
});
