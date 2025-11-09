// =======================================================
// /components/hodge/twisted.js
// =======================================================

import { hodgeTwisted } from "/components/hodge/twistedHodge.js";

document.addEventListener("DOMContentLoaded", () => {
  const nSlider = document.getElementById("n-slider-twisted");
  const kSlider = document.getElementById("k-slider-twisted");
  const tSlider = document.getElementById("t-slider-twisted");
  const nInput  = document.getElementById("n-value-twisted");
  const kInput  = document.getElementById("k-value-twisted");
  const tInput  = document.getElementById("t-value-twisted");
  const diamond = document.getElementById("diamond-container-twisted");

  const toInt = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? Math.trunc(x) : NaN;
  };

  // --- Slider vs Textbox Ranges ---
  nSlider.min = "1"; nSlider.max = "10";
  kSlider.min = "1"; kSlider.max = "10";
  tSlider.min = "-10"; tSlider.max = "10";

  nInput.min = "1"; nInput.max = "50";
  kInput.min = "1"; kInput.max = "50";
  tInput.min = "-50"; tInput.max = "50";

  // --- Clamp input to its min/max
  function clamp(el) {
    const min = Number(el.min);
    const max = Number(el.max);
    let v = Number(el.value);
    if (isNaN(v)) v = min;
    if (v < min) v = min;
    if (v > max) v = max;
    el.value = String(v);
    return v;
  }

  function syncKMaxToN() {
    const n = clamp(nInput);
    kSlider.max = Math.min(10, n);  // slider limited to 10 or n, whichever smaller
    kInput.max = String(n);         // textbox can go up to n
    clamp(kSlider);
    clamp(kInput);
  }

  function render() {
    const n = clamp(nInput);
    const k = Math.min(clamp(kInput), n);
    const t = clamp(tInput);
    kInput.value = k;
    kSlider.value = Math.min(k, Number(kSlider.max));

    const N = k * (n - k);
    if (N < 0 || !Number.isFinite(N)) {
      diamond.innerHTML = `<p class="error">Invalid parameters</p>`;
      return;
    }

    const results = hodgeTwisted(k, n, t);
    const hij = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0n));

    for (const { i, j, dimension } of results || []) {
      if (i >= 0 && j >= 0 && i <= N && j <= N) {
        hij[i][j] += BigInt(dimension);
      }
    }

    diamond.innerHTML = "";
    for (let r = 0; r <= 2 * N; r++) {
      const row = document.createElement("div");
      row.className = "diamond-row";
      for (let i = Math.max(0, r - N); i <= Math.min(r, N); i++) {
        const j = r - i;
        const val = hij[i]?.[j] ?? 0n;
        const span = document.createElement("span");
        span.className = "diamond-value";
        span.innerText = val.toString();
        row.appendChild(span);
      }
      diamond.appendChild(row);
    }
  }

  // --- Sync slider <-> textbox
  function link(slider, input, after = () => {}) {
    slider.addEventListener("input", () => {
      input.value = slider.value;
      after();
      render();
    });
    input.addEventListener("input", () => {
      const v = clamp(input);
      if (v >= Number(slider.min) && v <= Number(slider.max))
        slider.value = v;
      after();
      render();
    });
  }

  link(nSlider, nInput, syncKMaxToN);
  link(kSlider, kInput);
  link(tSlider, tInput);

  syncKMaxToN();
  render();
});
