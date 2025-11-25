// =======================================================
// /components/hodge/twisted.js — blank-friendly inputs, k≤n sync
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

  // --- helpers ---
  const intOrNull = (el) => {
    const s = (el?.value ?? "").trim();
    if (s === "") return null;
    const v = Number(s);
    return Number.isFinite(v) ? Math.trunc(v) : null;
  };
  const clampNum = (v, lo, hi) => {
    if (typeof lo === "number") v = Math.max(lo, v);
    if (typeof hi === "number") v = Math.min(hi, v);
    return v;
  };
  const normalizeInput = (el) => {
    const v = intOrNull(el);
    if (v === null) return null;
    const lo = Number(el.min ?? "-9007199254740991");
    const hi = Number(el.max ?? "9007199254740991");
    const c = clampNum(v, lo, hi);
    if (String(c) !== el.value) el.value = String(c);
    return c;
  };

  // --- Slider vs Textbox ranges ---
  nSlider.min = "1";   nSlider.max = "10";
  kSlider.min = "1";   kSlider.max = "10";
  tSlider.min = "-10"; tSlider.max = "10";

  nInput.min = "1";    nInput.max = "50";
  kInput.min = "1";    // kInput.max ties to n dynamically
  tInput.min = "-50";  tInput.max = "50";

  function applyKBoundsFromN() {
    const nVal = intOrNull(nInput);
    const nClamp = (nVal === null) ? 10 : clampNum(nVal, 1, 50);
    kSlider.max = String(Math.min(10, nClamp));
    kInput.max  = String(nClamp);
  }

  // --- render ---
  function render() {
    applyKBoundsFromN();

    const nRaw = intOrNull(nInput);
    const kRaw = intOrNull(kInput);
    const tRaw = intOrNull(tInput);

    if (nRaw === null || kRaw === null || tRaw === null) {
      diamond.innerHTML = `<p class="placeholder">Set n, k, t to see the twisted Hodge diamond.</p>`;
      return;
    }

    const n = clampNum(nRaw, 1, 50);
    const k = clampNum(kRaw, 1, Math.min(n, 50));
    const t = clampNum(tRaw, -50, 50);

    // keep sliders consistent (don’t stomp textboxes)
    const ns = clampNum(n, Number(nSlider.min), Number(nSlider.max));
    if (String(ns) !== nSlider.value) nSlider.value = String(ns);

    const ks = clampNum(k, Number(kSlider.min), Number(kSlider.max));
    if (String(ks) !== kSlider.value) kSlider.value = String(ks);

    const ts = clampNum(t, Number(tSlider.min), Number(tSlider.max));
    if (String(ts) !== tSlider.value) tSlider.value = String(ts);

    const N = k * (n - k);
    if (!Number.isFinite(N) || N < 0) {
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

  // --- link slider <-> textbox (blank-friendly) ---
  function link(slider, input, after = () => {}) {
    // slider -> input
    slider.addEventListener("input", () => {
      input.value = slider.value;
      after();
      render();
    });
    slider.addEventListener("change", () => {
      input.value = slider.value;
      after();
      render();
    });

    // textbox typing (allow blank)
    input.addEventListener("input", () => {
      const v = intOrNull(input);
      if (v === null) { after(); render(); return; }
      const lo = Number(slider.min);
      const hi = Number(slider.max);
      const c  = clampNum(v, lo, hi);
      if (String(c) !== slider.value) slider.value = String(c);
      after();
      render();
    });

    // textbox blur (normalize if numeric; keep blank as blank)
    input.addEventListener("blur", () => {
      const v = normalizeInput(input);
      if (v !== null) {
        const lo = Number(slider.min);
        const hi = Number(slider.max);
        const c  = clampNum(v, lo, hi);
        if (String(c) !== slider.value) slider.value = String(c);
      }
      after();
      render();
    });
  }

  function afterN() {
    applyKBoundsFromN();
  }

  link(nSlider, nInput, afterN);
  link(kSlider, kInput, () => {});
  link(tSlider, tInput, () => {});

  // initial
  applyKBoundsFromN();
  render();
});
