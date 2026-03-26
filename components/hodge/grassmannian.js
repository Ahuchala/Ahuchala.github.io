import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";
import { hodgeCompleteIntersection } from "/components/hodge/completeIntersectionHodgeNumbers.js";
import { hodgePrimitiveMiddleRow } from "/components/hodge/chiGrassmannianCI.js";

document.addEventListener("DOMContentLoaded", () =>
{
  const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
  const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
  const rSliderGrassmannian = document.getElementById("r-slider-grassmannian");
  const nValueGrassmannian = document.getElementById("n-value-grassmannian");
  const kValueGrassmannian = document.getElementById("k-value-grassmannian");
  const rValueGrassmannian = document.getElementById("r-value-grassmannian");
  const degreeTogglesGrassmannian = document.getElementById("degree-toggles-grassmannian");
  const diamondContainerGrassmannian = document.getElementById("diamond-container-grassmannian");

  // ---------------- utils to allow truly empty inputs ----------------
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

  // ---------------- blank-friendly slider<->textbox sync ----------------
  const syncSliderAndTextbox = (slider, textbox, onChange) =>
  {
    if (!slider || !textbox) return;

    const lo = parseInt(slider.min, 10);
    const hi = parseInt(slider.max, 10);

    // slider → textbox (always numeric)
    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });
    slider.addEventListener("change", () => {
      textbox.value = slider.value;
      onChange();
    });

    // textbox typing: allow empty; don't force/clamp while typing
    textbox.addEventListener("input", () => {
      const v = intOrNull(textbox);
      if (v === null) {
        // user cleared it — leave slider as-is
        onChange();
        return;
      }
      const c = clamp(v, lo, hi);
      if (String(c) !== slider.value) slider.value = String(c);
      onChange();
    });

    // textbox blur: normalize if numeric; keep empty if blank
    textbox.addEventListener("blur", () => {
      const v = intOrNull(textbox);
      if (v === null) { onChange(); return; }
      const c = clamp(v, lo, hi);
      if (textbox.value !== String(c)) textbox.value = String(c);
      if (slider.value !== String(c)) slider.value = String(c);
      onChange();
    });
  };

  function safeBigInt(val)
  {
    if (typeof val === "number") return BigInt(Math.floor(val));
    if (typeof val === "string") return BigInt(val.replace(/[, ]/g, ""));
    return BigInt(val.toString().replace(/[, ]/g, ""));
  }

  // ---------------- UI bits ----------------
  const updateDegreeTogglesGrassmannian = (r) =>
  {
    const currentCount = degreeTogglesGrassmannian.children.length;
    if (r > currentCount) {
      for (let i = currentCount; i < r; i++) {
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "degree-toggle";
        const label = document.createElement("label");
        label.innerText = `Degree of Hypersurface ${i + 1}:`;
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "50";
        input.value = "2";
        input.className = "hodge-input";
        toggleContainer.appendChild(label);
        toggleContainer.appendChild(input);
        degreeTogglesGrassmannian.appendChild(toggleContainer);
      }
    } else if (r < currentCount) {
      for (let i = currentCount - 1; i >= r; i--) {
        degreeTogglesGrassmannian.children[i].remove();
      }
    }
  };

  function constructMiddleRow(dimension, jsonData)
  {
    const isOdd = dimension % 2 === 1;
    const requiredLength = isOdd ? Math.floor(dimension / 2) + 1 : dimension / 2 + 1;
    const truncatedData = jsonData.slice(0, requiredLength);
    const middleRow = [...truncatedData];
    if (isOdd) {
      for (let i = truncatedData.length - 1; i >= 0; i--) middleRow.push(truncatedData[i]);
    } else {
      for (let i = truncatedData.length - 2; i >= 0; i--) middleRow.push(truncatedData[i]);
    }
    return middleRow;
  }

  // Renders the diamond once hodge data is available.
  function renderDiamond(k, n, r, degrees, hodgeNumbersForDegrees, isCompleteIntersection) {
    const dimension = k * (n - k) - r;
    const rows = 2 * dimension + 1;
    const middleRow = constructMiddleRow(dimension, hodgeNumbersForDegrees);
    const fullHodgeNumbers = hodgeGrassmannian(k, n);

    // Build all rows off-DOM first, then swap in one atomic replaceChildren call
    // so there is never a frame where the container is empty.
    const newRows = [];
    for (let i = 0; i < rows; i++) {
      const row = document.createElement("div");
      row.className = "diamond-row";
      const elements = i < dimension ? i + 1 : rows - i;
      for (let j = 0; j < elements; j++) {
        const valueCell = document.createElement("span");
        valueCell.className = "diamond-value";
        if (i === dimension) {
          if (isCompleteIntersection) {
            valueCell.innerText = middleRow[j] ?? "0";
          } else {
            const grassmannianValue = fullHodgeNumbers[i]?.[j] ?? 0;
            const jsonValue = middleRow[j] ?? "0";
            const sum = safeBigInt(grassmannianValue) + safeBigInt(jsonValue);
            valueCell.innerText = sum.toString();
          }
        } else if (i < dimension) {
          valueCell.innerText = fullHodgeNumbers[i]?.[j] ?? "0";
        } else {
          const mirrorRow = rows - i - 1;
          valueCell.innerText = fullHodgeNumbers[mirrorRow]?.[j] ?? "0";
        }
        row.appendChild(valueCell);
      }
      newRows.push(row);
    }
    diamondContainerGrassmannian.replaceChildren(...newRows);
  }

  const updateDiamondGrassmannian = async () =>
  {
    // read core inputs as nullable
    const n = intOrNull(nValueGrassmannian);
    const kRaw = intOrNull(kValueGrassmannian);
    const r = intOrNull(rValueGrassmannian);

    // If anything is blank, show a placeholder and bail
    if (n === null || kRaw === null || r === null) {
      diamondContainerGrassmannian.innerHTML =
        `<p class="placeholder">Enter n, k, r (or use sliders) to see the Hodge diamond.</p>`;
      return;
    }

    const k = Math.min(kRaw, n - kRaw);
    const dimension = k * (n - k) - r;

    if (dimension < 0) {
      diamondContainerGrassmannian.innerHTML =
        `<p class="error">Error: Dimension is negative. Ensure \\( r < k(n-k) \\).</p>`;
      return;
    }

    const rows = 2 * dimension + 1;

    // No hypersurfaces: just the Grassmannian (no JSON needed)
    if (r === 0) {
      const fullHodgeNumbers = hodgeGrassmannian(k, n);
      const newRows = [];
      for (let i = 0; i < rows; i++) {
        const row = document.createElement("div");
        row.className = "diamond-row";
        const elements = i < dimension ? i + 1 : rows - i;
        for (let j = 0; j < elements; j++) {
          const valueCell = document.createElement("span");
          valueCell.className = "diamond-value";
          valueCell.innerText = fullHodgeNumbers[i]?.[j] ?? "0";
          row.appendChild(valueCell);
        }
        newRows.push(row);
      }
      diamondContainerGrassmannian.replaceChildren(...newRows);
      return;
    }

    // r > 0: require all degrees filled to compute middle row
    const degreeVals = Array
      .from(degreeTogglesGrassmannian.querySelectorAll(".hodge-input"))
      .map(inp => intOrNull(inp));

    if (degreeVals.length !== r || degreeVals.some(v => v === null)) {
      diamondContainerGrassmannian.innerHTML =
        `<p class="placeholder">Fill all ${r} degree(s) to compute the middle row.</p>`;
      return;
    }

    const degrees = degreeVals.slice().sort((a, b) => b - a);
    const isCompleteIntersection = (k === 1 || k === n - 1);

    let hodgeNumbersForDegrees;
    if (isCompleteIntersection) {
      hodgeNumbersForDegrees = hodgeCompleteIntersection(degrees, n - 1);
      renderDiamond(k, n, r, degrees, hodgeNumbersForDegrees, true);
    } else {
      hodgeNumbersForDegrees = hodgePrimitiveMiddleRow(k, n, degrees);
      renderDiamond(k, n, r, degrees, hodgeNumbersForDegrees, false);
    }
  };

  // ---------------- wire up ----------------
  syncSliderAndTextbox(nSliderGrassmannian, nValueGrassmannian, updateDiamondGrassmannian);
  syncSliderAndTextbox(kSliderGrassmannian, kValueGrassmannian, updateDiamondGrassmannian);
  syncSliderAndTextbox(rSliderGrassmannian, rValueGrassmannian, () =>
  {
    const rv = intOrNull(rValueGrassmannian);
    if (rv !== null) updateDegreeTogglesGrassmannian(rv);
    updateDiamondGrassmannian();
  });

  degreeTogglesGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  nValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  kValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  rValueGrassmannian.addEventListener("input", () =>
  {
    const rv = intOrNull(rValueGrassmannian);
    if (rv !== null) updateDegreeTogglesGrassmannian(rv);
    updateDiamondGrassmannian();
  });

  // initial render without forcing a value
  const rInit = intOrNull(rValueGrassmannian);
  updateDegreeTogglesGrassmannian(rInit ?? 0);
  updateDiamondGrassmannian();
});
