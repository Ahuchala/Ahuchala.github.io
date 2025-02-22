import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";
import { hodgeCompleteIntersection } from "/components/hodge/completeIntersectionHodgeNumbers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
  const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
  const rSliderGrassmannian = document.getElementById("r-slider-grassmannian");
  const nValueGrassmannian = document.getElementById("n-value-grassmannian");
  const kValueGrassmannian = document.getElementById("k-value-grassmannian");
  const rValueGrassmannian = document.getElementById("r-value-grassmannian");
  const degreeTogglesGrassmannian = document.getElementById("degree-toggles-grassmannian");
  const diamondContainerGrassmannian = document.getElementById("diamond-container-grassmannian");

  // Load JSON data
  const response = await fetch("/components/hodge/grassmannian_hodge_numbers_factored.json");
  const hodgeData = await response.json();

  const syncSliderAndTextbox = (slider, textbox, onChange) => {
    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });

    textbox.addEventListener("input", () => {
      const value = Math.max(1, Math.min(parseInt(textbox.value) || 1, 50));
      textbox.value = value;
      slider.value = Math.min(value, parseInt(slider.max));
      onChange();
    });

    textbox.addEventListener("blur", () => {
      if (textbox.value === "") {
        textbox.value = slider.value;
      }
    });
  };

  // --- BigInt-based evaluation ---
  // Evaluate a math.js AST node using native BigInt arithmetic.
  function evalASTBigInt(node, scope) {
    if (node.isConstantNode) {
      return BigInt(node.value);
    } else if (node.isSymbolNode) {
      if (scope[node.name] !== undefined) {
        return scope[node.name];
      } else {
        throw new Error("Undefined symbol: " + node.name);
      }
    } else if (node.isOperatorNode) {
      const op = node.op;
      const args = node.args.map(arg => evalASTBigInt(arg, scope));
      switch (op) {
        case '+':
          return args[0] + args[1];
        case '-':
          return args[0] - args[1];
        case '*':
          return args[0] * args[1];
        case '/':
          if (args[0] % args[1] !== 0n) {
            throw new Error("Non-exact division: " + args[0] + " / " + args[1]);
          }
          return args[0] / args[1];
        case '^': {
          const exponent = parseInt(args[1].toString(), 10);
          return args[0] ** BigInt(exponent);
        }
        default:
          throw new Error("Unsupported operator: " + op);
      }
    } else if (node.isParenthesisNode) {
      return evalASTBigInt(node.content, scope);
    } else {
      throw new Error("Unsupported node type: " + node.type);
    }
  }

  // Evaluate a polynomial string of the form
  // "(a/b) * ( ... )"
  // Extract the constant fraction a/b, evaluate the remaining product using BigInt arithmetic,
  // and finally apply the constant fraction.
  function evaluatePolynomial(polynomial, degrees) {
    // Extract the leading fraction if present.
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
    // Parse remaining expression using math.js.
    const ast = math.parse(remainingStr);
    // Build scope: map variable names "d_1", "d_2", etc. to BigInts.
    let scope = {};
    degrees.forEach((deg, index) => {
      scope[`d_${index + 1}`] = BigInt(deg);
    });
    // Evaluate the expression exactly.
    const prodValue = evalASTBigInt(ast, scope);
    // Apply the constant fraction.
    const finalValue = (prodValue * constantNumerator) / constantDenom;
    // Since the result should be positive, return its absolute value.
    const absFinal = finalValue < 0n ? -finalValue : finalValue;
    return absFinal.toString();
  }
  // --- End BigInt-based evaluation ---

  const updateDegreeTogglesGrassmannian = (r) => {
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

  const constructMiddleRow = (dimension, jsonData) => {
    const isOdd = dimension % 2 === 1;
    const requiredLength = isOdd ? Math.floor(dimension / 2) + 1 : dimension / 2 + 1;
    const truncatedData = jsonData.slice(0, requiredLength);
    const middleRow = [...truncatedData];
    if (isOdd) {
      for (let i = truncatedData.length - 1; i >= 0; i--) {
        middleRow.push(truncatedData[i]);
      }
    } else {
      for (let i = truncatedData.length - 2; i >= 0; i--) {
        middleRow.push(truncatedData[i]);
      }
    }
    return middleRow;
  };

  const updateDiamondGrassmannian = () => {
    const n = parseInt(nValueGrassmannian.value);
    const kInput = parseInt(kValueGrassmannian.value);
    const k = Math.min(kInput, n - kInput);
    const r = parseInt(rValueGrassmannian.value);
    const dimension = k * (n - k) - r;
    if (dimension < 0) {
      diamondContainerGrassmannian.innerHTML = `<p class="error">Error: Dimension is negative. Ensure \( r < k(n-k) \).</p>`;
      return;
    }
    const rows = 2 * dimension + 1;
    diamondContainerGrassmannian.innerHTML = "";
    const degrees = Array.from(degreeTogglesGrassmannian.querySelectorAll(".hodge-input"))
                          .map(input => parseInt(input.value))
                          .sort((a, b) => b - a);
    let hodgeNumbersForDegrees;
    const key = `${k},${n},${r}`;
    if (r === 0) {
      hodgeNumbersForDegrees = hodgeGrassmannian(k, n);
    } else if (k === 1 || k === n - 1) {
      hodgeNumbersForDegrees = hodgeCompleteIntersection(degrees, n - 1);
    } else if (key in hodgeData) {
      const hodgePolynomials = hodgeData[key];
      hodgeNumbersForDegrees = hodgePolynomials.map(poly =>
        evaluatePolynomial(poly, degrees)
      );
    } else {
      diamondContainerGrassmannian.innerHTML = `<p class="error">Error: No data found for Gr(${k},${n}) with ${r} hypersurfaces.</p>`;
      console.error(`Key "${key}" not found in JSON data.`);
      return;
    }
    const middleRow = constructMiddleRow(dimension, hodgeNumbersForDegrees);
    const fullHodgeNumbers = hodgeGrassmannian(kInput, n);
    for (let i = 0; i < rows; i++) {
      const row = document.createElement("div");
      row.className = "diamond-row";
      const elements = i < dimension ? i + 1 : rows - i;
      for (let j = 0; j < elements; j++) {
        const valueCell = document.createElement("span");
        valueCell.className = "diamond-value";
        if (i === dimension) {
          const grassmannianValue = fullHodgeNumbers[i]?.[j] || 0;
          const jsonValue = middleRow[j] || "0";
          // Convert both to BigInt and add them
          const sum = BigInt(grassmannianValue) + BigInt(jsonValue);
          valueCell.innerText = sum.toString();
        } else if (i < dimension) {
          valueCell.innerText = fullHodgeNumbers[i]?.[j] || "0";
        } else {
          const mirrorRow = rows - i - 1;
          valueCell.innerText = fullHodgeNumbers[mirrorRow]?.[j] || "0";
        }
        row.appendChild(valueCell);
      }
      diamondContainerGrassmannian.appendChild(row);
    }
  };

  syncSliderAndTextbox(nSliderGrassmannian, nValueGrassmannian, updateDiamondGrassmannian);
  syncSliderAndTextbox(kSliderGrassmannian, kValueGrassmannian, updateDiamondGrassmannian);
  syncSliderAndTextbox(rSliderGrassmannian, rValueGrassmannian, () => {
    updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
    updateDiamondGrassmannian();
  });

  degreeTogglesGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  nValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  kValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
  rValueGrassmannian.addEventListener("input", () => {
    updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
    updateDiamondGrassmannian();
  });

  updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
  updateDiamondGrassmannian();
});
