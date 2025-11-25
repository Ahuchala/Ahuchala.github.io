// =======================================================
// /components/hodge/flag.js — preset-safe, blank-friendly
// =======================================================

import { hodgeFlag } from "/components/hodge/flagHodge.js";

document.addEventListener("DOMContentLoaded", async () => {
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

  // Load precomputed Hodge numbers JSON for complete intersections.
  let flagHodgeData = {};
  try {
    const response = await fetch("/components/hodge/flag_hodge_numbers_factored.json");
    flagHodgeData = await response.json();
  } catch (error) {
    console.error("Error loading flag_hodge_numbers_factored.json:", error);
  }

  // --- BigInt-based polynomial evaluation ---
  function evalASTBigInt(node, scope) {
    if (node.isConstantNode) {
      return BigInt(node.value);
    } else if (node.isSymbolNode) {
      if (scope[node.name] !== undefined) return scope[node.name];
      throw new Error("Undefined symbol: " + node.name);
    } else if (node.isOperatorNode) {
      const op = node.op;
      if (node.args.length === 1) {
        const a = evalASTBigInt(node.args[0], scope);
        if (op === "-") return -a;
        if (op === "+") return a;
        throw new Error("Unsupported unary operator: " + op);
      } else if (node.args.length === 2) {
        const L = evalASTBigInt(node.args[0], scope);
        const R = evalASTBigInt(node.args[1], scope);
        switch (op) {
          case "+": return L + R;
          case "-": return L - R;
          case "*": return L * R;
          case "/": return L / R;
          case "^": return L ** BigInt(Number(R));
          default: throw new Error("Unsupported operator: " + op);
        }
      } else {
        throw new Error("Operator with unexpected arity: " + node.args.length);
      }
    } else if (node.isParenthesisNode) {
      return evalASTBigInt(node.content, scope);
    }
    throw new Error("Unsupported node type: " + node.type);
  }
  // Set default values.
  dimsInput.value = "1,1,1";
  rValue.value = "2";
  rSlider.value = "2";

  function evaluatePolynomial(polynomial, flatDegrees) {
    const fracRegex = /^\s*\(([-+]?\d+)\/(\d+)\)\s*\*\s*/;
    const match = polynomial.match(fracRegex);
    let constantNumerator = 1n;
    let constantDenom = 1n;
    let remainingStr = polynomial;
    if (match) {
      constantNumerator = BigInt(match[1]);
      constantDenom = BigInt(match[2]);
      remainingStr = polynomial.slice(match[0].length);
    }
    const ast = math.parse(remainingStr);
    const scope = {};
    for (let i = 0; i < flatDegrees.length; i += 2) {
      scope[`d_${(i / 2) + 1}`] = BigInt(flatDegrees[i]);
      scope[`e_${(i / 2) + 1}`] = BigInt(flatDegrees[i + 1]);
    }
    const prodValue = evalASTBigInt(ast, scope);
    const finalValue = (prodValue * constantNumerator) / constantDenom;
    return finalValue < 0n ? (-finalValue).toString() : finalValue.toString();
  }
  // --- End polynomial evaluation ---

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

  function constructMiddleRow(expectedLength, halfRow) {
    const isOdd = expectedLength % 2 === 1;
    const L = isOdd ? Math.floor(expectedLength / 2) + 1 : expectedLength / 2;
    const truncated = halfRow.slice(0, L);
    const fullRow = truncated.slice();
    if (isOdd) {
      for (let i = L - 2; i >= 0; i--) fullRow.push(truncated[i]);
    } else {
      for (let i = L - 1; i >= 0; i--) fullRow.push(truncated[i]);
    }
    return fullRow;
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

    // dim of partial flag: sum_{i<j} dims[i]*dims[j]
    let dimF = 0;
    for (let i = 0; i < dims.length; i++) {
      for (let j = i + 1; j < dims.length; j++) dimF += dims[i] * dims[j];
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

    const ambientDiamond = hodgeFlag(dims);

    if (r === null || r === 0) {
      // Ambient only
      diamondContainer.innerHTML = "";
      ambientDiamond.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "diamond-row";
        row.forEach(val => {
          const cell = document.createElement("span");
          cell.className = "diamond-value";
          cell.innerText = val.toString();
          rowDiv.appendChild(cell);
        });
        diamondContainer.appendChild(rowDiv);
      });
      return;
    }

    // Complete intersection
    let d = dimF - r;
    if (d < 0) d = 0;
    const rows = 2 * d + 1;
    const truncatedAmbient = ambientDiamond.slice(0, d + 1);

    const key = "[" + dims.join(", ") + "]," + r;
    if (!(key in flagHodgeData)) {
      diamondContainer.innerHTML = `<p class="error">Error: No precomputed Hodge data for key "${key}" found.</p>`;
      return;
    }
    const polyArray = flagHodgeData[key];

    // Degrees
    const degreeInputs = Array.from(degreeToggles.children)
      .map(c => c.querySelector("input"))
      .filter(Boolean);

    if (degreeInputs.length !== r) {
      diamondContainer.innerHTML = `<p class="placeholder">Provide ${r} multidegree line(s) to compute the middle row.</p>`;
      return;
    }

    const flatDegrees = [];
    let incomplete = false;
    for (const inp of degreeInputs) {
      const val = (inp.value ?? "").trim();
      if (val === "") { incomplete = true; break; }
      const parts = val.split(",").map(s => parseInt(s.trim(), 10));
      if (parts.some(v => !Number.isFinite(v)) || parts.length !== numComponents) {
        incomplete = true; break;
      }
      flatDegrees.push(...parts);
    }
    if (incomplete) {
      diamondContainer.innerHTML = `<p class="placeholder">Each multidegree must have exactly ${numComponents} integers.</p>`;
      return;
    }

    // Simple ampleness check for bidegrees only (dims.length - 1 == 2)
    if (numComponents === 2) {
      for (let i = 0; i < flatDegrees.length; i += 2) {
        const a = flatDegrees[i];
        const b = flatDegrees[i + 1];
        if (!(2 * a > b)) {
          diamondContainer.innerHTML =
            `<p class="error">Hypersurface ${i / 2 + 1} with bidegree (${a}, ${b}) is not ample (requires 2a > b).</p>`;
          return;
        }
      }
    }

    // Evaluate JSON polynomials → half middle row
    const halfMiddleRow = polyArray.map(poly => {
      try { return BigInt(evaluatePolynomial(poly, flatDegrees)); }
      catch (e) { console.error("Error evaluating polynomial:", poly, e); return 0n; }
    });

    const primitiveMiddleRow = constructMiddleRow(d + 1, halfMiddleRow);
    const ambientMiddleRow = truncatedAmbient[d].map(v => BigInt(v));
    const combinedMiddle = ambientMiddleRow.map((v, i) => v + (primitiveMiddleRow[i] ?? 0n));

    // Build final diamond
    const finalDiamond = [];
    for (let i = 0; i < rows; i++) {
      if (i < d) {
        finalDiamond.push(truncatedAmbient[i]);
      } else if (i === d) {
        finalDiamond.push(combinedMiddle.map(x => x.toString()));
      } else {
        finalDiamond.push(truncatedAmbient[rows - i - 1]);
      }
    }

    // Render
    diamondContainer.innerHTML = "";
    finalDiamond.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "diamond-row";
      row.forEach(val => {
        const cell = document.createElement("span");
        cell.className = "diamond-value";
        cell.innerText = val.toString();
        rowDiv.appendChild(cell);
      });
      diamondContainer.appendChild(rowDiv);
    });
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

  // Initial update (no default stomping; respects any preset values already in the DOM).
  updateDiamondFlag();

  // Expose update function to container (used by your main scripts).
  const flagContainer = document.getElementById("flag-container");
  if (flagContainer) flagContainer.updateCalculator = updateDiamondFlag;
});
