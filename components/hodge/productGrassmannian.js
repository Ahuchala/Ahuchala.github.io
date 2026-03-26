import { hodgeDiamondProduct } from "./chiProductCI.js";

document.addEventListener("DOMContentLoaded", () => {
  const k1SliderProduct = document.getElementById("k1-slider-product");
  const n1SliderProduct = document.getElementById("n1-slider-product");
  const k2SliderProduct = document.getElementById("k2-slider-product");
  const n2SliderProduct = document.getElementById("n2-slider-product");
  const rSliderProduct  = document.getElementById("r-slider-product");

  const k1ValueProduct  = document.getElementById("k1-value-product");
  const n1ValueProduct  = document.getElementById("n1-value-product");
  const k2ValueProduct  = document.getElementById("k2-value-product");
  const n2ValueProduct  = document.getElementById("n2-value-product");
  const rValueProduct   = document.getElementById("r-value-product");

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
      const textVal  = Math.max(lo, v);
      const sliderVal = clamp(v, lo, hi);
      if (textbox.value !== String(textVal))  textbox.value  = String(textVal);
      if (slider.value  !== String(sliderVal)) slider.value  = String(sliderVal);
      onChange();
    });
  };

  // ---------------- degree toggle rows (each has 2 inputs) ----------------
  const updateDegreeTogglesProduct = (r) => {
    const currentCount = degreeTogglesProduct.children.length;
    if (r > currentCount) {
      for (let i = currentCount; i < r; i++) {
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "degree-toggle";

        const label = document.createElement("label");
        label.innerText = `Bidegree of Hypersurface ${i + 1}:`;

        const input1 = document.createElement("input");
        input1.type = "number";
        input1.min  = "1";
        input1.max  = "50";
        input1.value = "1";
        input1.className = "hodge-input";
        input1.dataset.factor = "0";

        const sep = document.createElement("span");
        sep.innerText = " × ";
        sep.style.margin = "0 4px";

        const input2 = document.createElement("input");
        input2.type = "number";
        input2.min  = "1";
        input2.max  = "50";
        input2.value = "1";
        input2.className = "hodge-input";
        input2.dataset.factor = "1";

        toggleContainer.appendChild(label);
        toggleContainer.appendChild(input1);
        toggleContainer.appendChild(sep);
        toggleContainer.appendChild(input2);
        degreeTogglesProduct.appendChild(toggleContainer);
      }
    } else if (r < currentCount) {
      for (let i = currentCount - 1; i >= r; i--) {
        degreeTogglesProduct.children[i].remove();
      }
    }
  };

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
    const n1Raw = intOrNull(n1ValueProduct);
    const k1Raw = intOrNull(k1ValueProduct);
    const n2Raw = intOrNull(n2ValueProduct);
    const k2Raw = intOrNull(k2ValueProduct);
    const r     = intOrNull(rValueProduct);

    if (n1Raw === null || k1Raw === null || n2Raw === null || k2Raw === null || r === null) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Enter all parameters to see the Hodge diamond.</p>`;
      return;
    }

    // Symmetry reduction: Gr(k,n) = Gr(n-k,n)
    const k1 = Math.min(k1Raw, n1Raw - k1Raw);
    const k2 = Math.min(k2Raw, n2Raw - k2Raw);

    if (k1 <= 0 || k2 <= 0 || n1Raw <= k1Raw || n2Raw <= k2Raw) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Need 0 &lt; k &lt; n for each factor.</p>`;
      return;
    }

    const dim = k1 * (n1Raw - k1) + k2 * (n2Raw - k2) - r;

    if (dim < 0) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Dimension is negative. Ensure \\( r \\leq \\dim(\\mathrm{Gr}(k_1,n_1)\\times\\mathrm{Gr}(k_2,n_2)) \\).</p>`;
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([diamondContainerProduct]);
      return;
    }

    // r = 0: no CI needed, compute product directly
    if (r === 0) {
      try {
        const diamond = hodgeDiamondProduct(k1, n1Raw, k2, n2Raw, []);
        renderProductDiamond(diamond);
      } catch (e) {
        console.error("hodgeDiamondProduct error:", e);
        diamondContainerProduct.innerHTML =
          `<p class="placeholder">Unable to compute Hodge diamond for these parameters.</p>`;
      }
      return;
    }

    // r > 0: need all bidegrees filled
    const degreeRows = Array.from(degreeTogglesProduct.querySelectorAll(".degree-toggle"));
    if (degreeRows.length !== r) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Fill all ${r} bidegree(s) to compute the diamond.</p>`;
      return;
    }

    const degrees = degreeRows.map(row => {
      const inputs = row.querySelectorAll(".hodge-input");
      return [intOrNull(inputs[0]), intOrNull(inputs[1])];
    });

    if (degrees.some(([d1, d2]) => d1 === null || d2 === null)) {
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Fill all ${r} bidegree(s) to compute the diamond.</p>`;
      return;
    }

    // Each bidegree component must be ≥ 1.
    // A component of 0 gives a non-ample divisor (e.g. O(0,d) pulls back from
    // one factor only), so the Lefschetz hyperplane theorem fails and the
    // formula for non-middle Hodge numbers is invalid.
    if (degrees.some(([d1, d2]) => d1 < 1 || d2 < 1)) {
      diamondContainerProduct.innerHTML =
        `<p class="error">Error: Both components of each bidegree must be \\(\\geq 1\\). ` +
        `A bidegree with a 0 component defines a non-ample divisor on the product, ` +
        `so the Lefschetz hyperplane theorem fails and the Hodge number formula is invalid.</p>`;
      if (window.MathJax?.typesetPromise) MathJax.typesetPromise([diamondContainerProduct]);
      return;
    }

    try {
      const diamond = hodgeDiamondProduct(k1, n1Raw, k2, n2Raw, degrees);
      renderProductDiamond(diamond);
    } catch (e) {
      console.error("hodgeDiamondProduct error:", e);
      diamondContainerProduct.innerHTML =
        `<p class="placeholder">Unable to compute Hodge diamond for these parameters.</p>`;
    }
  };

  // ---------------- preset loader ----------------
  const loadPreset = (k1, n1, k2, n2, r, degrees) => {
    k1ValueProduct.value = String(k1);
    k1SliderProduct.value = String(Math.min(k1, Number(k1SliderProduct.max)));
    n1ValueProduct.value = String(n1);
    n1SliderProduct.value = String(Math.min(n1, Number(n1SliderProduct.max)));
    k2ValueProduct.value = String(k2);
    k2SliderProduct.value = String(Math.min(k2, Number(k2SliderProduct.max)));
    n2ValueProduct.value = String(n2);
    n2SliderProduct.value = String(Math.min(n2, Number(n2SliderProduct.max)));
    rValueProduct.value  = String(r);
    rSliderProduct.value  = String(Math.min(r, Number(rSliderProduct.max)));

    updateDegreeTogglesProduct(r);

    const rows = degreeTogglesProduct.querySelectorAll(".degree-toggle");
    degrees.forEach(([d1, d2], i) => {
      if (rows[i]) {
        const inputs = rows[i].querySelectorAll(".hodge-input");
        if (inputs[0]) inputs[0].value = String(d1);
        if (inputs[1]) inputs[1].value = String(d2);
      }
    });

    updateDiamondProduct();
  };

  document.querySelectorAll("#preset-buttons-product .preset-button").forEach(button => {
    button.addEventListener("click", () => {
      const k1 = parseInt(button.dataset.k1, 10);
      const n1 = parseInt(button.dataset.n1, 10);
      const k2 = parseInt(button.dataset.k2, 10);
      const n2 = parseInt(button.dataset.n2, 10);
      const r  = parseInt(button.dataset.r,  10);
      // data-degrees: flat comma-separated list read in pairs, e.g. "2,3" => [[2,3]]
      const raw = (button.dataset.degrees || "").split(",").map(Number).filter(v => !isNaN(v));
      const degrees = [];
      for (let i = 0; i + 1 < raw.length; i += 2) degrees.push([raw[i], raw[i + 1]]);
      loadPreset(k1, n1, k2, n2, r, degrees);
    });
  });

  // ---------------- wire up sliders / textboxes ----------------
  syncSliderAndTextbox(k1SliderProduct, k1ValueProduct, updateDiamondProduct);
  syncSliderAndTextbox(n1SliderProduct, n1ValueProduct, updateDiamondProduct);
  syncSliderAndTextbox(k2SliderProduct, k2ValueProduct, updateDiamondProduct);
  syncSliderAndTextbox(n2SliderProduct, n2ValueProduct, updateDiamondProduct);
  syncSliderAndTextbox(rSliderProduct,  rValueProduct, () => {
    const rv = intOrNull(rValueProduct);
    if (rv !== null) updateDegreeTogglesProduct(rv);
    updateDiamondProduct();
  });

  k1ValueProduct.addEventListener("input", updateDiamondProduct);
  n1ValueProduct.addEventListener("input", updateDiamondProduct);
  k2ValueProduct.addEventListener("input", updateDiamondProduct);
  n2ValueProduct.addEventListener("input", updateDiamondProduct);
  rValueProduct.addEventListener("input", () => {
    const rv = intOrNull(rValueProduct);
    if (rv !== null) updateDegreeTogglesProduct(rv);
    updateDiamondProduct();
  });

  degreeTogglesProduct.addEventListener("input", updateDiamondProduct);

  // ---------------- initial render ----------------
  const rInit = intOrNull(rValueProduct);
  updateDegreeTogglesProduct(rInit ?? 0);
  updateDiamondProduct();
});
