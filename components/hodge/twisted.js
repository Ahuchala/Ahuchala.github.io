// =======================================================
// /components/hodge/twisted.js
// =======================================================

import { hodgeTwisted } from "/components/hodge/twistedHodge.js";

document.addEventListener("DOMContentLoaded", async () => {
  const nSliderTwisted = document.getElementById("n-slider-twisted");
  const kSliderTwisted = document.getElementById("k-slider-twisted");
  const tSliderTwisted = document.getElementById("t-slider-twisted");
  const nValueTwisted  = document.getElementById("n-value-twisted");
  const kValueTwisted  = document.getElementById("k-value-twisted");
  const tValueTwisted  = document.getElementById("t-value-twisted");
  const diamondContainerTwisted = document.getElementById("diamond-container-twisted");

  // ---- helpers
  const toInt = v => {
    const x = Number(v);
    return Number.isFinite(x) ? Math.trunc(x) : NaN;
  };

  // Force reflow (used for Chrome/Safari slider redraw quirk)
  const forceReflow = el => {
    el.style.display = "none";
    void el.offsetHeight;
    el.style.display = "";
  };

  // Keep k <= n at the DOM-attribute level (so native clamping works)
  const syncKMaxToN = () => {
    const n = toInt(nValueTwisted.value);
    if (!Number.isFinite(n)) return;

    // Update max attributes
    kSliderTwisted.max = String(n);
    kValueTwisted.max  = String(n);

    // If current value exceeds new max, clamp and visually re-render
    if (toInt(kSliderTwisted.value) > n) {
      kSliderTwisted.value = String(n);
      kValueTwisted.value  = String(n);
      forceReflow(kSliderTwisted); // visually update slider range
    }
  };

  // Clamp k to [k.min, n] and ensure both inputs match
  const clampKToN = () => {
    const n = toInt(nValueTwisted.value);
    if (!Number.isFinite(n)) return;
    const kMin = toInt(kSliderTwisted.min) || 1;
    let k = toInt(kValueTwisted.value);
    if (!Number.isFinite(k)) k = kMin;
    if (k > n) k = n;
    if (k < kMin) k = kMin;
    kSliderTwisted.value = String(k);
    kValueTwisted.value  = String(k);
  };

  let syncing = false;
  const syncPair = (slider, input, afterClamp = () => {}) => {
    // Slider → Input
    slider.addEventListener("input", () => {
      if (syncing) return;
      syncing = true;
      const v = toInt(slider.value);
      if (Number.isFinite(v)) input.value = String(v);
      afterClamp();
      updateDiamondTwisted();
      syncing = false;
    });

    // Input → Slider
    input.addEventListener("input", () => {
      if (syncing) return;
      const raw = toInt(input.value);
      if (!Number.isFinite(raw)) return; // ignore incomplete typing
      const sMin = toInt(slider.min);
      const sMax = toInt(slider.max);
      const clamped = Math.max(sMin, Math.min(raw, sMax));
      syncing = true;
      input.value  = String(clamped);
      slider.value = String(clamped);
      afterClamp();
      updateDiamondTwisted();
      syncing = false;
    });

    // Stabilize empty input on blur
    input.addEventListener("blur", () => {
      if (input.value === "") input.value = slider.value;
    });
  };

  // ---- main compute + render
  const updateDiamondTwisted = () => {
    // Keep k in range before any math
    syncKMaxToN();
    clampKToN();

    const n = toInt(nValueTwisted.value);
    const k = toInt(kValueTwisted.value);
    const t = toInt(tValueTwisted.value);

    const N = k * (n - k);
    if (!Number.isFinite(n) || !Number.isFinite(k) || !Number.isFinite(t) || N < 0) {
      diamondContainerTwisted.innerHTML = `<p class="error">Error: Invalid parameters.</p>`;
      return;
    }

    const results = hodgeTwisted(k, n, t);

    // Aggregate h^{i,j} as BigInt
    const hij = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0n));
    for (const r of results || []) {
      const i = r.i, j = r.j, dim = r.dimension;
      if (
        Number.isInteger(i) && Number.isInteger(j) &&
        i >= 0 && j >= 0 && i <= N && j <= N
      ) {
        const dimBig = typeof dim === "bigint" ? dim : BigInt(dim);
        hij[i][j] += dimBig;
      }
    }

    // Render 2N+1 rows: row r shows h^{0,r}, h^{1,r-1}, ..., h^{r,0}
    diamondContainerTwisted.innerHTML = "";
    for (let r = 0; r <= 2 * N; r++) {
      const row = document.createElement("div");
      row.className = "diamond-row";
      const iMin = Math.max(0, r - N);
      const iMax = Math.min(r, N);
      for (let i = iMin; i <= iMax; i++) {
        const j = r - i;
        const val = (hij[i] && hij[i][j]) ? hij[i][j] : 0n;
        const cell = document.createElement("span");
        cell.className = "diamond-value";
        cell.innerText = val.toString();
        row.appendChild(cell);
      }
      diamondContainerTwisted.appendChild(row);
    }
  };

  // ---- wiring
  syncPair(nSliderTwisted, nValueTwisted, () => { syncKMaxToN(); clampKToN(); });
  syncPair(kSliderTwisted, kValueTwisted, () => { clampKToN(); });
  syncPair(tSliderTwisted, tValueTwisted);

  // Initialize once
  syncKMaxToN();
  clampKToN();
  updateDiamondTwisted();
});
