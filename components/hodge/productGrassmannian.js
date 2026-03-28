import { hodgeDiamondProduct } from "./chiProductCI.js";

export function init() {
  const factorInputsProduct    = document.getElementById("factor-inputs-product");
  const addFactorBtn           = document.getElementById("add-factor-product");
  const removeFactorBtn        = document.getElementById("remove-factor-product");
  const rSliderProduct         = document.getElementById("r-slider-product");
  const rValueProduct          = document.getElementById("r-value-product");
  const degreeTogglesProduct   = document.getElementById("degree-toggles-product");
  const diamondContainerProduct = document.getElementById("diamond-container-product");

  // ---------------- utils ----------------
  function intOrNull(el) {
    const s = (el?.value ?? "").trim();
    if (s === "") return null;
    const v = parseInt(s, 10);
    return Number.isNaN(v) ? null : v;
  }
  function clamp(v, lo, hi) {
    if (typeof lo === "number") v = Math.max(lo, v);
    if (typeof hi === "number") v = Math.min(hi, v);
    return v;
  }

  // ---------------- blank-friendly slider <-> textbox sync ----------------
  const syncSliderAndTextbox = (slider, textbox, onChange) => {
    if (!slider || !textbox) return;
    const lo = parseInt(slider.min, 10);
    const hi = parseInt(slider.max, 10);

    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });
    slider.addEventListener("change", () => {
      textbox.value = slider.value;
      onChange();
    });

    textbox.addEventListener("input", () => {
      const v = intOrNull(textbox);
      if (v === null) { onChange(); return; }
      const sliderVal = clamp(v, lo, hi);
      if (String(sliderVal) !== slider.value) slider.value = String(sliderVal);
      onChange();
    });

    textbox.addEventListener("blur", () => {
      const v = intOrNull(textbox);
      if (v === null) { onChange(); return; }
      const textVal   = Math.max(lo, v);
      const sliderVal = clamp(v, lo, hi);
      if (textbox.value !== String(textVal))  textbox.value  = String(textVal);
      if (slider.value  !== String(sliderVal)) slider.value  = String(sliderVal);
      onChange();
    });
  };

  // ---------------- factor row management ----------------
  function getNumFactors() {
    return factorInputsProduct.querySelectorAll(".factor-row-product").length;
  }

  function updateRemoveButton() {
    removeFactorBtn.disabled = getNumFactors() <= 1;
  }

  // Measures all .input-row labels inside the product calculator and sets
  // them to the same width as the widest one, so all sliders line up.
  function alignLabels() {
    const container = document.getElementById("product-grassmannian-container");
    if (!container) return;
    const labels = Array.from(container.querySelectorAll(".input-row label"));
    labels.forEach(l => { l.style.minWidth = ""; });
    const maxW = labels.reduce((m, l) => Math.max(m, l.scrollWidth), 0);
    labels.forEach(l => { l.style.minWidth = maxW + "px"; });
  }

  function addFactorRow(kDefault = 1, nDefault = 2) {
    const idx = getNumFactors();
    const row = document.createElement("div");
    row.className = "factor-row-product";
    row.innerHTML = `
      <div class="input-row">
        <label>Ambient Dimension (\\(n_{${idx + 1}}\\)) for Factor&nbsp;${idx + 1}:</label>
        <input type="range"  class="factor-n-slider" min="2" max="10" value="${nDefault}">
        <input type="number" class="factor-n-value hodge-input" min="2" max="50" value="${nDefault}">
      </div>
      <div class="input-row">
        <label>Subspace Dimension (\\(k_{${idx + 1}}\\)) for Factor&nbsp;${idx + 1}:</label>
        <input type="range"  class="factor-k-slider" min="1" max="10" value="${kDefault}">
        <input type="number" class="factor-k-value hodge-input" min="1" max="50" value="${kDefault}">
      </div>`;
    factorInputsProduct.appendChild(row);
    // Wire sliders for this row (re-trigger on every change)
    syncSliderAndTextbox(
      row.querySelector(".factor-n-slider"),
      row.querySelector(".factor-n-value"),
      () => { rebuildDegreeRows(); updateDiamondProduct(); }
    );
    syncSliderAndTextbox(
      row.querySelector(".factor-k-slider"),
      row.querySelector(".factor-k-value"),
      () => { rebuildDegreeRows(); updateDiamondProduct(); }
    );
    // Also catch direct textbox edits not caught by blur/change
    row.querySelector(".factor-n-value").addEventListener("input",
      () => { rebuildDegreeRows(); updateDiamondProduct(); });
    row.querySelector(".factor-k-value").addEventListener("input",
      () => { rebuildDegreeRows(); updateDiamondProduct(); });
    updateRemoveButton();
  }

  addFactorBtn.addEventListener("click", () => {
    addFactorRow();
    rebuildDegreeRows();
    updateDiamondProduct();
    // Typeset only the new row, then realign
    const newRow = factorInputsProduct.lastElementChild;
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise([newRow]).then(alignLabels).catch(console.error);
    }
  });

  removeFactorBtn.addEventListener("click", () => {
    const rows = factorInputsProduct.querySelectorAll(".factor-row-product");
    if (rows.length > 1) rows[rows.length - 1].remove();
    updateRemoveButton();
    rebuildDegreeRows();
    updateDiamondProduct();
    alignLabels();
  });

  // ---------------- read factors from DOM ----------------
  function readFactors() {
    return Array.from(factorInputsProduct.querySelectorAll(".factor-row-product")).map(row => ({
      k: intOrNull(row.querySelector(".factor-k-value")),
      n: intOrNull(row.querySelector(".factor-n-value")),
    }));
  }

  // ---------------- degree toggle rows ----------------
  // Rebuilds all degree rows based on current r and numFactors,
  // preserving existing values where possible.
  function rebuildDegreeRows() {
    const r          = intOrNull(rValueProduct) ?? 0;
    const numFactors = getNumFactors();

    // Save current input values (jagged — old rows may have different widths)
    const saved = Array.from(degreeTogglesProduct.querySelectorAll(".degree-toggle")).map(row =>
      Array.from(row.querySelectorAll(".hodge-input")).map(inp => inp.value)
    );

    degreeTogglesProduct.innerHTML = "";
    for (let i = 0; i < r; i++) {
      const toggle = document.createElement("div");
      toggle.className = "degree-toggle";

      const label = document.createElement("label");
      label.innerText = `Multidegree of Hypersurface ${i + 1}:`;
      toggle.appendChild(label);

      for (let fi = 0; fi < numFactors; fi++) {
        if (fi > 0) {
          const sep = document.createElement("span");
          sep.innerText = " × ";
          sep.style.margin = "0 4px";
          toggle.appendChild(sep);
        }
        const inp = document.createElement("input");
        inp.type      = "number";
        inp.min       = "1";
        inp.max       = "50";
        inp.value     = saved[i]?.[fi] ?? "1";
        inp.className = "hodge-input";
        inp.dataset.factor = String(fi);
        toggle.appendChild(inp);
      }
      degreeTogglesProduct.appendChild(toggle);
    }
  }

  // ---------------- render diamond from 2D array ----------------
  function renderProductDiamond(diamond) {
    const newRows = [];
    for (let i = 0; i < diamond.length; i++) {
      const row = document.createElement("div");
      row.className = "diamond-row";
      for (let j = 0; j < diamond[i].length; j++) {
        const valueCell = document.createElement("span");
        valueCell.className = "diamond-value";
        valueCell.innerText = String(diamond[i][j]);
        row.appendChild(valueCell);
      }
      newRows.push(row);
    }
    diamondContainerProduct.replaceChildren(...newRows);
  }

  // ---------------- main update ----------------
  const updateDiamondProduct = () => {
    const r       = intOrNull(rValueProduct);
    const factors = readFactors();

    if (r === null || factors.some(({ k, n }) => k === null || n === null)) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Enter all parameters to see the Hodge diamond.</p>`;
      return;
    }

    // Symmetry reduction: Gr(k,n) ≅ Gr(n−k,n)
    const validFactors = factors.map(({ k, n }) => ({ n, k: Math.min(k, n - k) }));

    if (validFactors.some(({ k, n }) => k <= 0 || n <= k)) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Need \\(0 &lt; k &lt; n\\) for each factor.</p>`;
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([diamondContainerProduct]).catch(console.error);
      return;
    }

    const totalDim = validFactors.reduce((s, { k, n }) => s + k * (n - k), 0);
    const dim      = totalDim - r;

    if (dim < 0) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Dimension is negative. ` +
        `Ensure \\( r \\leq \\dim(X) \\).</p>`;
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([diamondContainerProduct]).catch(console.error);
      return;
    }

    // r = 0: show ambient product diamond directly
    if (r === 0) {
      try {
        renderProductDiamond(hodgeDiamondProduct(validFactors, []));
      } catch (e) {
        console.error("hodgeDiamondProduct error:", e);
        diamondContainerProduct.innerHTML =
          `<p class="placeholder">Unable to compute Hodge diamond for these parameters.</p>`;
      }
      return;
    }

    // r > 0: need all multidegrees filled
    const degreeRows = Array.from(degreeTogglesProduct.querySelectorAll(".degree-toggle"));
    if (degreeRows.length !== r) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Fill all ${r} multidegree(s) to compute the diamond.</p>`;
      return;
    }

    const degrees = degreeRows.map(row =>
      Array.from(row.querySelectorAll(".hodge-input")).map(inp => intOrNull(inp))
    );

    if (degrees.some(tuple => tuple.some(d => d === null))) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Fill all ${r} multidegree(s) to compute the diamond.</p>`;
      return;
    }

    // Each degree component must be ≥ 1 (ampleness requirement for Lefschetz).
    // A component of 0 gives a non-ample divisor (e.g. O(0,d) pulls back from
    // one factor only), so the Lefschetz hyperplane theorem fails and the
    // formula for non-middle Hodge numbers is invalid.
    if (degrees.some(tuple => tuple.some(d => d < 1))) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Every component of each multidegree must be \\(\\geq 1\\). ` +
        `A component of 0 defines a non-ample divisor, so the Lefschetz hyperplane theorem ` +
        `fails and the Hodge number formula is invalid.</p>`;
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([diamondContainerProduct]).catch(console.error);
      return;
    }

    try {
      renderProductDiamond(hodgeDiamondProduct(validFactors, degrees));
    } catch (e) {
      console.error("hodgeDiamondProduct error:", e);
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Unable to compute Hodge diamond for these parameters.</p>`;
    }
  };

  // ---------------- preset loader ----------------
  const loadPreset = (factors, r, degrees) => {
    // Remove all existing factor rows and rebuild
    factorInputsProduct.innerHTML = "";
    for (const { k, n } of factors) addFactorRow(k, n);

    rValueProduct.value  = String(r);
    rSliderProduct.value = String(Math.min(r, Number(rSliderProduct.max)));

    rebuildDegreeRows();

    const rows = degreeTogglesProduct.querySelectorAll(".degree-toggle");
    degrees.forEach((tuple, i) => {
      if (!rows[i]) return;
      const inputs = rows[i].querySelectorAll(".hodge-input");
      tuple.forEach((d, fi) => { if (inputs[fi]) inputs[fi].value = String(d); });
    });

    updateDiamondProduct();
    // Realign after MathJax re-typesets the newly created factor rows
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise([factorInputsProduct]).then(alignLabels).catch(console.error);
    } else {
      alignLabels();
    }
  };

  document.querySelectorAll("#preset-buttons-product .preset-button").forEach(button => {
    button.addEventListener("click", () => {
      const r     = parseInt(button.dataset.r, 10);
      // data-factors: flat comma-separated k,n pairs e.g. "1,2,1,3" → [{k:1,n:2},{k:1,n:3}]
      const rawF  = (button.dataset.factors || "").split(",").map(Number);
      const factors = [];
      for (let i = 0; i + 1 < rawF.length; i += 2) factors.push({ k: rawF[i], n: rawF[i + 1] });
      const numF  = factors.length;
      // data-degrees: flat list, read in groups of numF e.g. "2,3" + 2 factors → [[2,3]]
      const rawD  = (button.dataset.degrees || "").split(",").map(Number).filter(v => !isNaN(v));
      const degrees = [];
      for (let i = 0; i + numF - 1 < rawD.length; i += numF) {
        degrees.push(rawD.slice(i, i + numF));
      }
      loadPreset(factors, r, degrees);
    });
  });

  // ---------------- wire up r slider / textbox ----------------
  syncSliderAndTextbox(rSliderProduct, rValueProduct, () => {
    rebuildDegreeRows();
    updateDiamondProduct();
  });
  rValueProduct.addEventListener("input", () => {
    rebuildDegreeRows();
    updateDiamondProduct();
  });

  degreeTogglesProduct.addEventListener("input", updateDiamondProduct);

  // ---------------- initial render ----------------
  addFactorRow(1, 2); // Factor 1: default Gr(1,2) = P¹
  addFactorRow(1, 2); // Factor 2: default Gr(1,2) = P¹
  rebuildDegreeRows();
  updateDiamondProduct();
  // Typeset the dynamically-created factor rows so MathJax renders their
  // subscripts before the user opens the calculator. Don't call alignLabels
  // here — the container is hidden so scrollWidth would return 0.
  function typesetFactorRows() {
    MathJax.typesetPromise([factorInputsProduct]).then(() => {
      const c = document.getElementById("product-grassmannian-container");
      if (c && c.style.display !== "none") alignLabels();
    }).catch(console.error);
  }
  if (window.MathJax?.typesetPromise) {
    typesetFactorRows();
  } else {
    window.addEventListener("mathjax-ready", typesetFactorRows, { once: true });
  }
}
