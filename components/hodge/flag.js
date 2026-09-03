// =======================================================
// /components/hodge/flag.js — preset-safe, blank-friendly
//
// UI for complete intersections in type-A partial flag
// varieties. All Hodge numbers are computed exactly in the
// browser by flagChi.js (Borel–Weil–Bott); there is no
// precomputed data and no external math library.
// =======================================================

import { hodgeFlag } from "/components/hodge/flagHodge.js";
import { hodgeDiamondFlagCI } from "/components/hodge/flagChi.js";

export function init() {
  // DOM element selectors.
  const dimsInput = document.getElementById("dims-input");
  const rSlider = document.getElementById("r-slider-flag");
  const rValue = document.getElementById("r-value-flag");
  const degreeToggles = document.getElementById("degree-toggles-flag");
  const diamondContainer = document.getElementById("diamond-container-flag");
  const flagDescription = document.getElementById("flag-description");

  // ---------- helpers ----------
  function intOrNull(el) {
    const s = (el?.value ?? "").trim();
    if (s === "") return null;
    const v = parseInt(s, 10);
    return Number.isNaN(v) ? null : v;
  }
  function clampNum(v, lo, hi) {
    if (typeof lo === "number") v = Math.max(lo, v);
    if (typeof hi === "number") v = Math.min(hi, v);
    return v;
  }

  // Set default values.
  dimsInput.value = "1,1,1";
  rValue.value = "1";
  rSlider.value = "1";

  // Preserve user/preset-entered multidegrees; only add/remove rows.
  function updateDegreeTogglesFlag(r, numComponents) {
    const currentCount = degreeToggles.children.length;

    // Snapshot existing input values (to restore after reflow).
    const oldVals = Array.from(degreeToggles.children).map(c => {
      const inp = c.querySelector("input");
      return inp ? inp.value : "";
    });

    const target = Math.max(0, r | 0);
    if (target > currentCount) {
      for (let i = currentCount; i < target; i++) {
        const container = document.createElement("div");
        container.className = "degree-toggle";

        const label = document.createElement("label");
        label.innerText = `Multidegree of Hypersurface ${i + 1} (enter ${numComponents} numbers, comma separated):`;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "hodge-input";
        // DEFAULT: "1,1,...,1" with length = numComponents
        input.value = Array(Math.max(0, numComponents)).fill("1").join(", ");
        input.addEventListener("input", updateDiamondFlag);

        container.appendChild(label);
        container.appendChild(input);
        degreeToggles.appendChild(container);
      }
    } else if (target < currentCount) {
      for (let i = currentCount - 1; i >= target; i--) {
        degreeToggles.removeChild(degreeToggles.children[i]);
      }
    }

    // Restore previous text for all rows that still exist
    for (let i = 0; i < Math.min(target, oldVals.length); i++) {
      const inp = degreeToggles.children[i]?.querySelector("input");
      if (inp && inp.value !== oldVals[i]) inp.value = oldVals[i];
    }
  }

  function renderDiamond(rows) {
    // Build all rows off-DOM first, then swap atomically.
    const newRows = [];
    rows.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "diamond-row";
      row.forEach(val => {
        const cell = document.createElement("span");
        cell.className = "diamond-value";
        cell.innerText = val.toString();
        rowDiv.appendChild(cell);
      });
      newRows.push(rowDiv);
    });
    diamondContainer.replaceChildren(...newRows);
  }

  // --- main render ---
  function updateDiamondFlag() {
    const dimsRaw = (dimsInput?.value ?? "").trim();

    if (dimsRaw === "") {
      flagDescription.innerText = "Hodge diamond";
      diamondContainer.innerHTML = `<p class="placeholder">Enter dimensions (e.g. 1,1,1) and r to compute.</p>`;
      return;
    }

    const dims = dimsRaw
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(Number.isFinite);

    if (dims.length < 2) {
      flagDescription.innerText = "Please enter at least two dimensions.";
      diamondContainer.innerHTML = "";
      return;
    }

    const r = intOrNull(rValue);
    const numComponents = Math.max(0, dims.length - 1);

    // Keep degree inputs aligned with r (when r is numeric)
    if (r !== null) updateDegreeTogglesFlag(r, numComponents);

    // Description
    if (r === null || r === 0) {
      flagDescription.innerHTML = `Hodge diamond for a flag variety of dimensions [${dims.join(", ")}]`;
    } else {
      const degreesDesc = Array.from(degreeToggles.children)
        .map(c => {
          const inp = c.querySelector("input");
          return inp ? `[${(inp.value ?? "").trim()}]` : "[]";
        })
        .join(", ");
      flagDescription.innerHTML =
        `Hodge diamond for a complete intersection (r=${r}) in a partial flag of dimensions [${dims.join(", ")}] with multidegrees ${degreesDesc}`;
    }

    // Ambient flag variety (r = 0): cheap closed form, no dimension cap.
    if (r === null || r === 0) {
      if (dims.some(a => a < 1)) {
        diamondContainer.innerHTML = `<p class="error">Each dimension jump must be a positive integer.</p>`;
        return;
      }
      renderDiamond(hodgeFlag(dims));
      return;
    }

    // Degrees
    const degreeInputs = Array.from(degreeToggles.children)
      .map(c => c.querySelector("input"))
      .filter(Boolean);

    if (degreeInputs.length !== r) {
      diamondContainer.innerHTML = `<p class="placeholder">Provide ${r} multidegree line(s) to compute the middle row.</p>`;
      return;
    }

    const degrees = [];
    let incomplete = false;
    for (const inp of degreeInputs) {
      const val = (inp.value ?? "").trim();
      if (val === "") { incomplete = true; break; }
      const parts = val.split(",").map(s => parseInt(s.trim(), 10));
      if (parts.some(v => !Number.isFinite(v)) || parts.length !== numComponents) {
        incomplete = true; break;
      }
      degrees.push(parts);
    }
    if (incomplete) {
      diamondContainer.innerHTML = `<p class="placeholder">Each multidegree must have exactly ${numComponents} integers.</p>`;
      return;
    }

    // Compute exactly via Borel–Weil–Bott. Errors (non-ample degree,
    // dimension cap, r > dim) surface as messages from flagChi.js.
    try {
      renderDiamond(hodgeDiamondFlagCI(dims, degrees));
    } catch (err) {
      diamondContainer.innerHTML = `<p class="error">${err.message}</p>`;
    }
  }

  // --- slider<->textbox link for r (blank-friendly) ---
  function linkSliderTextbox(slider, input, after = () => {}) {
    if (!slider || !input) return;

    const lo = Number(slider.min ?? "0");
    const hi = Number(slider.max ?? "10");

    // slider → textbox
    slider.addEventListener("input", () => {
      input.value = slider.value;
      after();
      updateDiamondFlag();
    });
    slider.addEventListener("change", () => {
      input.value = slider.value;
      after();
      updateDiamondFlag();
    });

    // textbox typing: allow blank
    input.addEventListener("input", () => {
      const v = intOrNull(input);
      if (v === null) {
        after();
        updateDiamondFlag();
        return;
      }
      const c = clampNum(v, lo, hi);
      if (String(c) !== slider.value) slider.value = String(c);
      after();
      updateDiamondFlag();
    });

    // textbox blur: normalize if numeric; keep blank if empty
    input.addEventListener("blur", () => {
      const v = intOrNull(input);
      if (v === null) { after(); updateDiamondFlag(); return; }
      const c = clampNum(v, Number(slider.min ?? "0"), Number(slider.max ?? "10"));
      if (input.value !== String(c)) input.value = String(c);
      if (slider.value !== String(c)) slider.value = String(c);
      after();
      updateDiamondFlag();
    });
  }

  linkSliderTextbox(rSlider, rValue, () => {
    const rNow = intOrNull(rValue);
    const dims = (dimsInput?.value ?? "").trim()
      .split(",").map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
    const numComponents = Math.max(0, dims.length - 1);
    if (rNow !== null) updateDegreeTogglesFlag(rNow, numComponents);
  });

  // Recompute on dims change; preserve degree text, resize rows only.
  dimsInput.addEventListener("input", () => {
    const rNow = intOrNull(rValue);
    const dims = (dimsInput?.value ?? "").trim()
      .split(",").map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
    const numComponents = Math.max(0, dims.length - 1);
    if (rNow !== null) updateDegreeTogglesFlag(rNow, numComponents);
    updateDiamondFlag();
  });

  // Expose update function to container (used by your main scripts).
  const flagContainer = document.getElementById("flag-container");
  if (flagContainer) flagContainer.updateCalculator = updateDiamondFlag;

  // Initial update — wrapped in a resolved promise so callers can await
  // full initialization (state restore from shared URLs relies on this).
  updateDiamondFlag();
  return Promise.resolve();
}
