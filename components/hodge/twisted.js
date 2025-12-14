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

  // --- Create info box (twisted-only) ---
  const infoBox = document.createElement("div");
  infoBox.id = "twisted-info-box";
  infoBox.className = "twisted-info-box";
  infoBox.style.display = "none";
  infoBox.innerHTML =
    "<em>Click an entry in the twisted Hodge diamond to see contributing partitions.</em>";

  if (diamond && diamond.parentNode) {
    diamond.insertAdjacentElement("afterend", infoBox);
  }

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

  // ======================================================
  // --- render twisted Hodge diamond + data for info box ---
  // ======================================================
  function render() {
    applyKBoundsFromN();

    const nRaw = intOrNull(nInput);
    const kRaw = intOrNull(kInput);
    const tRaw = intOrNull(tInput);

    if (nRaw === null || kRaw === null || tRaw === null) {
      diamond.innerHTML =
        `<p class="placeholder">Set n, k, t to see the twisted Hodge diamond.</p>`;
      infoBox.style.display = "none";
      return;
    }

    const n = clampNum(nRaw, 1, 50);
    const k = clampNum(kRaw, 1, Math.min(n, 50));
    const t = clampNum(tRaw, -50, 50);

    // keep sliders consistent
    const ns = clampNum(n, Number(nSlider.min), Number(nSlider.max));
    if (String(ns) !== nSlider.value) nSlider.value = String(ns);

    const ks = clampNum(k, Number(kSlider.min), Number(kSlider.max));
    if (String(ks) !== kSlider.value) kSlider.value = String(ks);

    const ts = clampNum(t, Number(tSlider.min), Number(tSlider.max));
    if (String(ts) !== tSlider.value) tSlider.value = String(ts);

    const N = k * (n - k);
    if (!Number.isFinite(N) || N < 0) {
      diamond.innerHTML = `<p class="error">Invalid parameters</p>`;
      infoBox.style.display = "none";
      return;
    }

    const results = hodgeTwisted(k, n, t);

    // hij[i][j] = { total: BigInt, contributors: [] }
    const hij = Array.from({ length: N + 1 }, () =>
      Array.from({ length: N + 1 }, () => ({
        total: 0n,
        contributors: [],
      }))
    );

    for (const { i, j, lambda, dimension } of results || []) {
      if (i >= 0 && j >= 0 && i <= N && j <= N) {
        hij[i][j].total += BigInt(dimension);
        hij[i][j].contributors.push({
          lambda: lambda.slice(),
          dimension,
        });
      }
    }

    // Build DOM
    diamond.innerHTML = "";

    // TOP row first (r = 2N), bottom row last (r = 0)
    for (let r = 2 * N; r >= 0; r--) {
      const row = document.createElement("div");
      row.className = "diamond-row";

      for (let i = Math.max(0, r - N); i <= Math.min(r, N); i++) {
        const j = r - i;
        const cell = hij[i][j];
        const val = cell.total;

        const span = document.createElement("span");
        span.className = "diamond-value";
        span.innerText = val.toString();

        // Encode partition contributions (twisted only)
        if (cell.contributors.length > 0) {
          span.dataset.twistedContrib = encodeURIComponent(JSON.stringify(cell.contributors));
          span.classList.add("has-contrib");   // ← add this line
      } else {
          span.dataset.twistedContrib = "";
          span.classList.remove("has-contrib");
      }


        row.appendChild(span);
      }

      diamond.appendChild(row);
    }

    // Hide info box until user clicks something
    infoBox.style.display = "none";
  }

  // ======================================================
  // --- twisted-diamond click handler ---
  // ======================================================
  diamond?.addEventListener("click", (event) => {
    const target = event.target.closest(".diamond-value");
    if (!target) return;

    const encoded = target.dataset.twistedContrib || "";
    let contrib = [];

    if (encoded) {
      try {
        contrib = JSON.parse(decodeURIComponent(encoded));
      } catch (e) {
        console.error("Failed to decode twisted contrib:", e);
      }
    }

    const i = target.dataset.i ?? "?";
    const j = target.dataset.j ?? "?";

    if (!contrib.length) {
      infoBox.style.display = "block";
      infoBox.innerHTML = `
        <p><strong>(i, j) = (${i}, ${j})</strong> has no contributing partitions.</p>
      `;
      return;
    }

    const list = contrib
      .map(({ lambda, dimension }) => {
        const lamStr = lambda.length ? `(${lambda.join(", ")})` : "()";
        return `<li>λ = ${lamStr}, dim = ${dimension}</li>`;
      })
      .join("");

    infoBox.style.display = "block";
    infoBox.innerHTML = `
      <p><strong>Partitions contributing to $H^{${j}}(\\Omega^{${i}}(t))$:</strong></p>
      <ul>${list}</ul>
    `;

    // Re-typeset MathJax for the updated box
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([infoBox]);
    }

  });


  // --- link slider <-> textbox (blank-friendly) ---
  function link(slider, input, after = () => {}) {
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
