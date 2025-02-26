import { hodgeFlag } from "/components/hodge/flagHodge.js";

let flagHodgeData = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/components/hodge/flag_hodge_numbers_factored.json");
    flagHodgeData = await response.json();
  } catch (err) {
    console.error("Could not load flag_hodge_numbers_factored.json:", err);
  }

  const dimsInput = document.getElementById("dims-input");
  dimsInput.value = "1,1,1"; // Default example changed to [1,1,1]

  const rSlider = document.getElementById("r-slider-flag");
  const rValue = document.getElementById("r-value-flag");
  const degreeTogglesContainer = document.getElementById("degree-toggles-flag");
  const diamondContainer = document.getElementById("diamond-container-flag");
  const flagDescription = document.getElementById("flag-description");

  function syncSliderAndTextbox(slider, textbox, onChange, maxValue = 50) {
    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });
    slider.addEventListener("change", () => {
      textbox.value = slider.value;
      onChange();
    });
    textbox.addEventListener("input", () => {
      const value = Math.max(0, Math.min(parseInt(textbox.value) || 0, maxValue));
      textbox.value = value;
      slider.value = value;
      onChange();
    });
    textbox.addEventListener("blur", () => {
      if (textbox.value === "") {
        textbox.value = slider.value;
      }
    });
  }

  function updateDegreeTogglesFlag(r) {
    while (degreeTogglesContainer.children.length > r) {
      degreeTogglesContainer.removeChild(degreeTogglesContainer.lastChild);
    }
    while (degreeTogglesContainer.children.length < r) {
      const idx = degreeTogglesContainer.children.length;
      const rowDiv = document.createElement("div");
      rowDiv.className = "degree-toggle";
      const label = document.createElement("label");
      label.innerText = `Multidegree of Hypersurface ${idx + 1} (comma-separated):`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = "1,2"; // example default
      input.className = "hodge-input";
      input.addEventListener("input", updateDiamondFlag);

      rowDiv.appendChild(label);
      rowDiv.appendChild(input);
      degreeTogglesContainer.appendChild(rowDiv);
    }
  }

  // Evaluate a polynomial in variables d_1..d_r,e_1..e_r using a BigInt-based approach.
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
        case '+': return args[0] + args[1];
        case '-': return args[0] - args[1];
        case '*': return args[0] * args[1];
        case '/': return args[0] / args[1];
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

  function evaluateFlagPolynomial(polyStr, dVals, eVals) {
    // Handle possible prefactor like (a/b)*(...)
    const fracRegex = /^\s*\(([-+]?\d+)\/(\d+)\)\s*\*\s*/;
    const match = polyStr.match(fracRegex);
    let constantNumerator = 1n;
    let constantDenom = 1n;
    let remainingStr = polyStr;
    if (match) {
      constantNumerator = BigInt(match[1]);
      constantDenom = BigInt(match[2]);
      remainingStr = polyStr.slice(match[0].length);
    }
    const ast = math.parse(remainingStr);
    const scope = {};
    dVals.forEach((val, i) => {
      scope[`d_${i+1}`] = BigInt(val);
    });
    eVals.forEach((val, i) => {
      scope[`e_${i+1}`] = BigInt(val);
    });
    let val = evalASTBigInt(ast, scope);
    val = (val * constantNumerator) / constantDenom;
    if (val < 0n) val = -val;
    return val.toString();
  }

  function buildFullRowFromHalf(halfVals, neededLength) {
    const arr = [...halfVals];
    const isOdd = (neededLength % 2 === 1);
    if (isOdd) {
      const mirrorPart = arr.slice(0, arr.length - 1).reverse();
      return arr.concat(mirrorPart);
    } else {
      const mirrorPart = arr.slice().reverse();
      return arr.concat(mirrorPart);
    }
  }

  function updateDiamondFlag() {
    // 1) Parse dims
    const dimsRaw = dimsInput.value.trim();
    const dims = dimsRaw.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    
    // 2) parse r
    const r = parseInt(rValue.value, 10) || 0;
    updateDegreeTogglesFlag(r);

    // Build a short phrase about dims
    const dimsPhrase = `Fl(${dims.join(",")})`;

    if (r === 0) {
      const diamond = hodgeFlag(dims);
      // Title: "Hodge diamond for Fl(...)"
      renderDiamond(
        diamond,
        `Hodge diamond for ${dimsPhrase}`,
        diamondContainer
      );
      return;
    }

    // If r=1 => "Hodge diamond for a hypersurface of multidegree ... in Fl(...)"
    // If r>1 => "Hodge diamond for a complete intersection of r hypersurfaces of multidegree ... in Fl(...)"

    if (dims.length === 2) {
      diamondContainer.innerHTML = `<p class="error">For len(dims)=2, use the Grassmannian calculator.</p>`;
      return;
    }
    if (dims.length > 3) {
      diamondContainer.innerHTML = `<p class="error">Hodge numbers for len(dims) > 3 not yet supported.</p>`;
      return;
    }
    if (dims.length !== 3) {
      diamondContainer.innerHTML = `<p class="error">Invalid dims. Expecting length 3 or less. Got [${dims}].</p>`;
      return;
    }

    // parse the (d_i,e_i)
    const rowDivs = Array.from(degreeTogglesContainer.children);
    if (rowDivs.length !== r) {
      diamondContainer.innerHTML = `<p class="error">Mismatch: # of multi-degree rows != r.</p>`;
      return;
    }
    let dVals = [];
    let eVals = [];
    for (let i = 0; i < r; i++) {
      const input = rowDivs[i].querySelector("input");
      if (!input) {
        diamondContainer.innerHTML = `<p class="error">No input found for hypersurface #${i+1}.</p>`;
        return;
      }
      const arr = input.value.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      if (arr.length !== 2) {
        diamondContainer.innerHTML = `<p class="error">Each hypersurface needs 2 integers: (d_i,e_i). Found: ${input.value}.</p>`;
        return;
      }
      dVals.push(arr[0]);
      eVals.push(arr[1]);
    }

    // Summarize the "multidegree" in a string
    // e.g. if r=1 => "(d1,e1)", if r>1 => "((d1,e1),(d2,e2))" or something
    let multiDegStr = "";
    if (r === 1) {
      multiDegStr = `(${dVals[0]},${eVals[0]})`;
    } else {
      const pairs = [];
      for (let i = 0; i < r; i++) {
        pairs.push(`(${dVals[i]},${eVals[i]})`);
      }
      multiDegStr = pairs.join(", ");
    }

    // Build the JSON key
    const key = `[${dims.join(", ")}],${r}`;
    if (!flagHodgeData || !(key in flagHodgeData)) {
      diamondContainer.innerHTML = `<p class="error">No data in JSON for key="${key}".</p>`;
      return;
    }
    const hodgePolys = flagHodgeData[key];

    // Dimension
    let dimF = 0;
    const n = dims.reduce((a,b)=>a+b,0);
    let mprev = 0;
    for (let i=0; i<dims.length; i++){
      const mi = mprev + dims[i];
      dimF += (n - mi)*(mi - mprev);
      mprev = mi;
    }
    const dimensionCI = dimF - r;
    if (dimensionCI < 0) {
      diamondContainer.innerHTML = `<p class="error">Error: dimension < 0. Possibly r too large.</p>`;
      return;
    }
    const totalRows = 2*dimensionCI + 1;

    // Evaluate polynomials
    const halfValues = hodgePolys.map(polyStr => evaluateFlagPolynomial(polyStr, dVals, eVals));
    const middleRowLength = dimensionCI + 1;
    const fullMiddleRowValues = buildFullRowFromHalf(halfValues, middleRowLength);

    // Build base diamond (r=0)
    const baseDiamond = hodgeFlag(dims);

    // Merge them
    const finalDiamond = [];
    for (let i=0; i< totalRows; i++){
      const rowSize = (i<=dimensionCI)? (i+1) : (2*dimensionCI - i +1);
      const rowArr = [];
      for (let j=0; j<rowSize; j++){
        if (i < dimensionCI){
          if (i< dimF) {
            rowArr.push(baseDiamond[i]?.[j] || 0);
          } else {
            rowArr.push(0);
          }
        } else if (i === dimensionCI){
          let baseVal = 0n;
          if (dimF < baseDiamond.length) {
            baseVal = BigInt(baseDiamond[dimF]?.[j] || 0);
          }
          let addedVal = 0n;
          if (fullMiddleRowValues[j]) {
            addedVal = BigInt(fullMiddleRowValues[j]);
          }
          rowArr.push((baseVal + addedVal).toString());
        } else {
          const mirrorI = 2*dimensionCI - i;
          if (mirrorI < dimF) {
            rowArr.push(baseDiamond[mirrorI]?.[j] || 0);
          } else {
            rowArr.push(0);
          }
        }
      }
      finalDiamond.push(rowArr);
    }

    // Title:
    let desc = "";
    if (r === 1) {
      desc = `Hodge diamond for a hypersurface of multidegree ${multiDegStr} in ${dimsPhrase}`;
    } else {
      desc = `Hodge diamond for a complete intersection of ${r} hypersurfaces of multidegree ${multiDegStr} in ${dimsPhrase}`;
    }

    renderDiamond(finalDiamond, desc, diamondContainer);
  }

  function renderDiamond(diamond2D, title, container) {
    flagDescription.innerHTML = title;
    container.innerHTML = "";
    diamond2D.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "diamond-row";
      row.forEach(val => {
        const cell = document.createElement("span");
        cell.className = "diamond-value";
        cell.innerText = val.toString();
        rowDiv.appendChild(cell);
      });
      container.appendChild(rowDiv);
    });
  }

  syncSliderAndTextbox(rSlider, rValue, updateDiamondFlag, 10);
  dimsInput.addEventListener("input", updateDiamondFlag);

  updateDiamondFlag();
  document.getElementById("flag-container").updateCalculator = updateDiamondFlag;
});
