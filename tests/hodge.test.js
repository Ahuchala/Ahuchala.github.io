import { test } from "node:test";
import assert from "node:assert/strict";

import { hodgeCompleteIntersection } from "../components/hodge/completeIntersectionHodgeNumbers.js";
import { hodgeGrassmannian } from "../components/hodge/grassmannianHodge.js";
import { hodgeAbelianVariety } from "../components/hodge/abelianVarietyHodgeNumbers.js";
import { hodgeFlag } from "../components/hodge/flagHodge.js";
import { hodgeTwisted } from "../components/hodge/twistedHodge.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build a sparse Map "(i,j)" → total dimension from hodgeTwisted output.
 * Only includes entries with dimension > 0.
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

test("CI: cubic in P² (elliptic curve, h^{1,0} = h^{0,1} = 1)", () => {
  assert.deepEqual(hodgeCompleteIntersection([3], 2), [1, 1]);
});

test("CI: quartic in P³ (K3 surface, h^{1,1} = 20)", () => {
  assert.deepEqual(hodgeCompleteIntersection([4], 3), [1, 20, 1]);
});

test("CI: quintic in P⁴ (Calabi-Yau threefold, h^{2,1} = 101)", () => {
  assert.deepEqual(hodgeCompleteIntersection([5], 4), [1, 101, 101, 1]);
});

test("CI: quadric and cubic in P⁴ (K3 surface, K_X = O(2+3-5) = trivial)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 3], 4), [1, 20, 1]);
});

test("CI: two quadrics in P⁴ (del Pezzo degree 4, K_X = O(-1))", () => {
  assert.deepEqual(hodgeCompleteIntersection([2, 2], 4), [0, 6, 0]);
});

test("CI: conic in P² (P¹, genus 0)", () => {
  assert.deepEqual(hodgeCompleteIntersection([2], 2), [0, 0]);
});

test("CI: hyperplane in P³ (P², trivial middle row)", () => {
  assert.deepEqual(hodgeCompleteIntersection([1], 3), [0, 1, 0]);
});

// ─── Grassmannians ──────────────────────────────────────────────────────────

test("Gr(1,3) = P²: full Hodge diamond", () => {
  assert.deepEqual(hodgeGrassmannian(1, 3), [
    [1],
    [0, 0],
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

test("Flag [2,2] = Gr(2,4): full Hodge diamond matches Grassmannian", () => {
  assert.deepEqual(hodgeFlag([2, 2]), hodgeGrassmannian(2, 4));
});

// ─── Twisted Hodge ───────────────────────────────────────────────────────────

test("Twisted k=1,n=2,t=1: H⁰(P¹, O(1)) = 2, no other non-zero entries", () => {
  const m = twistedMap(hodgeTwisted(1, 2, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 2);
});

test("Twisted k=1,n=3,t=1: H⁰(P², O(1)) = 3, no other non-zero entries", () => {
  const m = twistedMap(hodgeTwisted(1, 3, 1));
  assert.equal(m.size, 1);
  assert.equal(m.get("0,0"), 3);
});

test("Twisted k=2,n=4,t=0: untwisted Gr(2,4) diagonal, no off-diagonal entries", () => {
  const m = twistedMap(hodgeTwisted(2, 4, 0));
  assert.equal(m.size, 5);
  assert.equal(m.get("0,0"), 1);
  assert.equal(m.get("1,1"), 1);
  assert.equal(m.get("2,2"), 2);
  assert.equal(m.get("3,3"), 1);
  assert.equal(m.get("4,4"), 1);
});
