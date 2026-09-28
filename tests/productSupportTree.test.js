// Known-example tests for the support-tree extension of the product
// Grassmannian calculator (multidegrees with zero entries).
//
// Each expected value comes from a source independent of the support-tree
// code: Künneth, the Cayley trick, adjunction, Bézout, or a second
// presentation of the same variety. Irreducible pieces are computed by the
// single-Grassmannian calculator (chiGrassmannianCI.js), a separate code path.
//
// Conventions: squares are h[p][q] = h^{p,q}; P(n) is P^n = Gr(1, n+1).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hodgeSquareSupportTree as H,
  hodgeDiamondProduct,
  UnsupportedSupportError,
  EmptyIntersectionError,
} from "../components/hodge/chiProductCI.js";
import { hodgeDiamondCI } from "../components/hodge/chiGrassmannianCI.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const P = n => ({ k: 1, n: n + 1 });

// Diamond rows (row idx has p+q = 2N−idx, leftmost entry has largest p) → square.
function toSquare(diamond) {
  const N = (diamond.length - 1) / 2;
  const h = Array.from({ length: N + 1 }, () => new Array(N + 1).fill(0));
  diamond.forEach((row, idx) => {
    const r = 2 * N - idx;
    row.forEach((x, s) => { const p = Math.min(r, N) - s; h[p][r - p] = x; });
  });
  return h;
}

// Smooth CI of the given degrees in P^n (independent single-Grassmannian code).
const ciP = (n, degrees) => toSquare(hodgeDiamondCI(1, n + 1, degrees));
const ciGr = (k, n, degrees) => toSquare(hodgeDiamondCI(k, n, degrees));
const Pn = n => ciP(n, []);

function kunneth(...hs) {
  return hs.reduce((A, B) => {
    const a = A.length - 1, b = B.length - 1;
    const out = Array.from({ length: a + b + 1 }, () => new Array(a + b + 1).fill(0));
    for (let p = 0; p <= a; p++) for (let q = 0; q <= a; q++) if (A[p][q])
      for (let r = 0; r <= b; r++) for (let s = 0; s <= b; s++)
        out[p + r][q + s] += A[p][q] * B[r][s];
    return out;
  });
}

// H(X) = H(Y) ⊗ H(P^{m−1}) ⊕ H(W)(−m): the Cayley trick for X ⊂ Y × P^m cut by
// L ⊠ O(1), with W ⊂ Y the common zero locus of the m+1 sections of L
// (W = null when m+1 > dim Y, so X is a P^{m−1}-bundle over Y).
function cayley(Y, m, W) {
  let h = kunneth(Y, Pn(m - 1));
  if (W) {
    const n = h.length - 1, w = W.length - 1;
    h = h.map(row => row.slice());
    for (let p = 0; p <= w; p++) for (let q = 0; q <= w; q++) {
      assert.ok(p + m <= n && q + m <= n);
      h[p + m][q + m] += W[p][q];
    }
  }
  return h;
}

const betti = h => {
  const N = h.length - 1;
  return Array.from({ length: 2 * N + 1 }, (_, k) =>
    h.reduce((acc, row, p) => acc + (row[k - p] ?? 0), 0));
};

// ─── 1. Pullbacks from one factor: X_d × (untouched factors) ────────────────

test("(3,0) on P²×P² is E × P²", () => {
  const h = H([P(2), P(2)], [[3, 0]]);
  assert.deepEqual(h, kunneth(ciP(2, [3]), Pn(2)));
  assert.deepEqual(betti(h), [1, 2, 2, 2, 2, 2, 1]);
  assert.equal(h[1][0], 1);
  assert.equal(h[2][1], 1);
});

test("pullbacks from P^a agree with CI × P^b", () => {
  const cases = [
    [3, 1, [4]],       // quartic K3 × P¹
    [4, 2, [3]],       // cubic threefold × P²
    [2, 3, [5]],       // genus-6 plane quintic × P³
    [4, 1, [2, 2]],    // degree-4 del Pezzo surface × P¹
    [5, 1, [2, 3]],    // (2,3) threefold in P⁵ × P¹
  ];
  for (const [a, b, ds] of cases) {
    const eqs = ds.map(d => [d, 0]);
    assert.deepEqual(H([P(a), P(b)], eqs), kunneth(ciP(a, ds), Pn(b)), `P^${a}×P^${b}, ${ds}`);
    // Same thing with the factors swapped.
    assert.deepEqual(H([P(b), P(a)], eqs.map(([x, y]) => [y, x])), kunneth(ciP(a, ds), Pn(b)));
  }
});

test("pullback from a genuine Grassmannian factor", () => {
  // Quadric section and cubic section of Gr(2,5), times P¹ and P².
  assert.deepEqual(H([{ k: 2, n: 5 }, P(1)], [[2, 0]]), kunneth(ciGr(2, 5, [2]), Pn(1)));
  assert.deepEqual(H([{ k: 2, n: 5 }, P(2)], [[1, 0], [3, 0]]), kunneth(ciGr(2, 5, [1, 3]), Pn(2)));
});

// ─── 2. Disjoint supports: products of CIs ───────────────────────────────────

test("disjoint supports give Künneth products", () => {
  // E × E' (abelian surface), K3 × E, curve × curve × curve.
  assert.deepEqual(H([P(2), P(2)], [[3, 0], [0, 3]]), kunneth(ciP(2, [3]), ciP(2, [3])));
  assert.deepEqual(H([P(3), P(2)], [[4, 0], [0, 3]]), kunneth(ciP(3, [4]), ciP(2, [3])));
  assert.deepEqual(
    H([P(2), P(2), P(2)], [[3, 0, 0], [0, 4, 0], [0, 0, 5]]),
    kunneth(ciP(2, [3]), ciP(2, [4]), ciP(2, [5])));
  // Disjoint pieces with a bystander factor in between.
  assert.deepEqual(
    H([P(2), P(1), P(3)], [[3, 0, 0], [0, 0, 2], [0, 0, 2]]),
    kunneth(ciP(2, [3]), Pn(1), ciP(3, [2, 2])));
});

test("disjoint supports on Grassmannian × P^n", () => {
  // Gr(2,4) cut by (2), times a plane cubic.
  assert.deepEqual(H([{ k: 2, n: 4 }, P(2)], [[2, 0], [0, 3]]), kunneth(ciGr(2, 4, [2]), ciP(2, [3])));
});

// ─── 3. Gr(2,4) = quadric in P⁵: two presentations agree ─────────────────────

test("Gr(2,4) presentations: CI in Gr(2,4) × P^m vs CI in the quadric Q⁴ ⊂ P⁵", () => {
  for (const ds of [[1], [2], [3], [1, 1], [1, 2], [2, 2]]) {
    const viaGr = H([{ k: 2, n: 4 }, P(1)], ds.map(d => [d, 0]));
    assert.deepEqual(viaGr, kunneth(ciP(5, [2, ...ds]), Pn(1)), `degrees ${ds}`);
  }
});

// ─── 4. Cayley trick: (a,1) cuts of Y × P^m ──────────────────────────────────

test("Cayley trick, bundle case (m+1 > dim Y)", () => {
  // Plane quartic C × P², cut by (1,1): P¹-bundle over C.
  assert.deepEqual(H([P(2), P(2)], [[4, 0], [1, 1]]), cayley(ciP(2, [4]), 2, null));
  assert.deepEqual(H([P(2), P(2)], [[4, 0], [1, 1]]), [[1, 3, 0], [3, 2, 3], [0, 3, 1]]);
  // Plane cubic × P³, cut by (2,1): P²-bundle over E.
  assert.deepEqual(H([P(2), P(3)], [[3, 0], [2, 1]]), cayley(ciP(2, [3]), 3, null));
  // Quartic K3 × P³, cut by (1,1): P²-bundle over K3.
  assert.deepEqual(H([P(3), P(3)], [[4, 0], [1, 1]]), cayley(ciP(3, [4]), 3, null));
});

test("Cayley trick with a nonempty centre W (m+1 ≤ dim Y)", () => {
  // Cubic threefold Y × P², cut by (1,1): W = Y ∩ 3 hyperplanes = 3 points.
  const fano = H([P(4), P(2)], [[3, 0], [1, 1]]);
  assert.deepEqual(fano, cayley(ciP(4, [3]), 2, ciP(4, [3, 1, 1, 1])));
  assert.deepEqual(betti(fano), [1, 0, 2, 10, 5, 10, 2, 0, 1]);
  assert.equal(fano[1][2], 5);

  const cases = [
    // [n, Y degrees, m, a]: Y ⊂ P^n, cut Y × P^m by (a,1); W = Y ∩ (m+1) hypersurfaces of degree a.
    [3, [4], 1, 1],    // K3 × P¹, W = 4 points
    [3, [4], 1, 2],    // K3 × P¹, W = 16 points
    [3, [3], 1, 1],    // cubic surface × P¹
    [4, [3], 1, 1],    // cubic threefold × P¹, W = plane cubic
    [4, [2], 1, 2],    // quadric threefold × P¹, W = (2,2,2) curve
    [4, [2, 2], 1, 1], // dP4 × P¹
    [5, [3], 2, 1],    // cubic fourfold × P², W = cubic curve
    [5, [3], 1, 1],    // cubic fourfold × P¹, W = cubic surface
  ];
  for (const [n, ds, m, a] of cases) {
    const eqs = [...ds.map(d => [d, 0]), [a, 1]];
    const W = ciP(n, [...ds, ...new Array(m + 1).fill(a)]);
    assert.deepEqual(H([P(n), P(m)], eqs), cayley(ciP(n, ds), m, W), `Y=${ds} in P^${n}, m=${m}, a=${a}`);
  }
});

test("Cayley trick over the bare factor (no child support)", () => {
  // (1,1) on P^n × P^m, m+1 ≤ n: X is P^{m−1}-bundle over P^n with W = P^{n−m−1}.
  for (const [n, m] of [[2, 1], [3, 1], [3, 2], [4, 2]]) {
    assert.deepEqual(H([P(n), P(m)], [[1, 1]]), cayley(Pn(n), m, Pn(n - m - 1)), `P^${n}×P^${m}`);
  }
});

// ─── 5. Three-level nesting ──────────────────────────────────────────────────

test("three nested supports {1} ⊂ {1,2} ⊂ {1,2,3}", () => {
  // E ⊂ P²; (1,1) on E × P² gives S = P¹-bundle over E; (1,1,1) on S × P²
  // gives a P¹-bundle over S (3 sections, dim S = 2, no common zeros).
  const h = H([P(2), P(2), P(2)], [[3, 0, 0], [1, 1, 0], [1, 1, 1]]);
  assert.deepEqual(h, kunneth(ciP(2, [3]), Pn(1), Pn(1)));
});

test("nested and disjoint mixed: (E-bundle) × (K3)", () => {
  // Supports {1} ⊂ {1,2} and a disjoint {3}.
  assert.deepEqual(
    H([P(2), P(2), P(3)], [[3, 0, 0], [1, 1, 0], [0, 0, 4]]),
    kunneth(cayley(ciP(2, [3]), 2, null), ciP(3, [4])));
});

// ─── 6. Curves: genus by adjunction ──────────────────────────────────────────

test("curves in C₁ × C₂ cut by (a,b): genus from adjunction", () => {
  // C_i plane curve of degree d_i, genus g_i. For C ∈ |O(a,b)| on C₁×C₂:
  //   C² = 2·(a d₁)(b d₂),  K·C = (2g₁−2)·b d₂ + (2g₂−2)·a d₁,  g = 1 + (C² + K·C)/2.
  const genus = d => (d - 1) * (d - 2) / 2;
  for (const [d1, d2, a, b] of [[3, 3, 1, 1], [3, 4, 1, 1], [4, 4, 1, 2], [3, 3, 2, 1], [5, 3, 1, 1]]) {
    const [g1, g2] = [genus(d1), genus(d2)];
    const C2 = 2 * (a * d1) * (b * d2);
    const KC = (2 * g1 - 2) * b * d2 + (2 * g2 - 2) * a * d1;
    const g = 1 + (C2 + KC) / 2;
    const h = H([P(2), P(2)], [[d1, 0], [0, d2], [a, b]]);
    assert.deepEqual(h, [[1, g], [g, 1]], `d=(${d1},${d2}), (a,b)=(${a},${b})`);
  }
  // E × E' cut by (1,1): genus 10.
  assert.equal(H([P(2), P(2)], [[3, 0], [0, 3], [1, 1]])[1][0], 10);
});

// ─── 7. Points: Bézout ───────────────────────────────────────────────────────

test("zero-dimensional intersections: point counts by Bézout", () => {
  // Points on P^a (∏ d_i of them) × P^b, then b cuts of degree (e_j, f_j):
  // each copy of P^b is cut in ∏ f_j points.
  assert.deepEqual(H([P(1), P(1)], [[3, 0]]), [[3, 0], [0, 3]]);
  assert.deepEqual(H([P(1), P(1)], [[3, 0], [1, 1]]), [[3]]);
  assert.deepEqual(H([P(2), P(2)], [[2, 0], [3, 0], [1, 2], [5, 1]]), [[6 * 2]]);
  assert.deepEqual(H([P(1), P(1), P(1)], [[2, 0, 0], [0, 3, 0], [1, 1, 4]]), [[2 * 3 * 4]]);
  // (2,0),(0,2) on P¹×P¹: 2 × 2 = 4 points.
  assert.deepEqual(H([P(1), P(1)], [[2, 0], [0, 2]]), [[4]]);
});

test("disconnected positive-dimensional pieces: h^{0,0} counts components", () => {
  // Two points × E: two disjoint elliptic curves.
  assert.deepEqual(H([P(1), P(2)], [[2, 0], [0, 3]]), [[2, 2], [2, 2]]);
  // (2,0),(3,0) on P² give 6 points; times E: six disjoint elliptic curves.
  assert.deepEqual(H([P(2), P(2)], [[2, 0], [3, 0], [0, 3]]), [[6, 6], [6, 6]]);
});

// ─── 8. Structural invariants ────────────────────────────────────────────────

test("factor and equation permutations leave the answer unchanged", () => {
  const base = H([P(2), P(2), P(3)], [[3, 0, 0], [1, 1, 0], [0, 0, 4]]);
  assert.deepEqual(H([P(2), P(2), P(3)], [[0, 0, 4], [1, 1, 0], [3, 0, 0]]), base);
  assert.deepEqual(H([P(3), P(2), P(2)], [[4, 0, 0], [0, 1, 1], [0, 3, 0]]), base);
});

test("all-positive inputs: support tree agrees with the ample formula", () => {
  // hodgeDiamondProduct only uses the support tree when a zero is present,
  // so compare the two code paths directly.
  const cases = [
    [[P(1), P(2)], [[2, 3]]],
    [[P(2), P(2)], [[3, 3]]],
    [[P(1), P(1), P(1)], [[2, 2, 2]]],
    [[{ k: 2, n: 4 }, P(2)], [[1, 1], [1, 2]]],
    [[{ k: 2, n: 5 }, P(1)], [[1, 1], [1, 1], [2, 1]]],
  ];
  for (const [f, d] of cases) assert.deepEqual(H(f, d), toSquare(hodgeDiamondProduct(f, d)));
});

// ─── 9. Rejections ───────────────────────────────────────────────────────────

test("rejected inputs", () => {
  // Crossing supports {1,2}, {2,3}.
  assert.throws(() => H([P(1), P(1), P(1)], [[1, 1, 0], [0, 1, 1]]), UnsupportedSupportError);
  // Crossing supports even when each is fine alone.
  assert.throws(() => H([P(2), P(2), P(2)], [[1, 1, 0], [1, 0, 1]]), UnsupportedSupportError);
  // Overdetermined: 3 equations supported on P².
  assert.throws(() => H([P(2), P(2)], [[1, 0], [1, 0], [1, 0]]), EmptyIntersectionError);
  // Overdetermined counting descendants: (2,0),(0,2) are points; (1,1) then empty.
  assert.throws(() => H([P(1), P(1)], [[2, 0], [0, 2], [1, 1]]), EmptyIntersectionError);
  // All-zero equation.
  assert.throws(() => H([P(1), P(1)], [[0, 0]]));
});
