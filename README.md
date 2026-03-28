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
| Complete intersections in **Gr**(k,n) | Hyperplane in **Gr**(3,10) |
| Flag varieties | Fl(1,2,3; 4) |
| Twisted Hodge numbers | **Gr**(2,5) twisted by O(2) |
| CIs in products of Grassmannians | Elliptic Curve in  **P**¹ x **P**¹|

**Quartic surface in P³ (K3 surface):**
```
        1
      0   0
    1   20  1
      0   0
        1
```

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
