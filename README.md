# Andy Huchala

Personal research website for Andy Huchala, a mathematics grad student at the University of Oregon.
The main feature is a suite of interactive Hodge diamond calculators.

**[ahuchala.github.io](https://ahuchala.github.io)**

---

## Hodge Diamond Calculator

Given a smooth algebraic variety over ℂ, the **Hodge diamond** is the grid of integers $h^{p,q} = \dim H^q(X, \Omega^p_X)$ — a fundamental geometric invariant. The calculator supports six families of varieties:

| Calculator | Example |
|---|---|
| Complete intersections in **P**ⁿ | Quartic K3 surface in **P**³ |
| Abelian varieties | Jacobian of a genus-3 curve |
| Complete intersections in **Gr**(k,n) |Debarre-Voisin Hyperplane in **Gr**(3,10) |
| Flag varieties | Fl(1,2,3; 4) |
| Twisted Hodge numbers | **Gr**(2,5) twisted by O(2) |
| CIs in products of Grassmannians | Elliptic Curve (Hypersurface of degree (2,2) in  **P**¹ x **P**¹)|

**Quartic surface in P³ (K3 surface):**
```
        1
      0   0
    1   20  1
      0   0
        1
```

**Debarre–Voisin 20-fold (hyperplane in Gr(3,10)):** a 20-dimensional variety; the diamond
has 41 rows. Most Hodge numbers are zero — the non-trivial ones are:
```
h^{p,p} = 1, 1, 2, 3, 4, 5, 7, 8, 9, 10, 30, 10, 9, 8, 7, 5, 4, 3, 2, 1, 1   (p = 0…20)
```
All off-diagonal Hodge numbers are zero except `h^{11,9} = h^{9,11} = 1`.

## Gallery

The [gallery](/gallery) collects mathematical art and visualizations, including:

- **Abelian sandpiles** — a 9000×9000 sandpile with 2³⁰ grains, rendered over a month on a GPU
- **Zeta functions** — complex plots of Hasse-Weil zeta functions of varieties over finite fields
- **Ising model simulations**, Julia sets, Weierstrass functions, Lie algebra characters, and more

## Running locally

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

No build step. No dependencies.

```bash
npm test   # validates Hodge numbers against known results from the literature
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for a technical overview of the codebase.
