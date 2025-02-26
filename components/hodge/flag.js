import { hodgeFlag } from "/components/hodge/flagHodge.js";

let flagHodgeData = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load the JSON data with the polynomials for partial flags
    const response = await fetch("/components/hodge/flag_hodge_numbers_factored.json");
    flagHodgeData = await response.json();
  } catch (err) {
    console.error("Could not load flag_hodge_numbers_factored.json:", err);
  }

  const dimsInput = document.getElementById("dims-input");
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

  // Create or remove the rows for each hypersurface’s multi-degree input.
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

  function updateDiamondFlag() {
    // 1) Parse dims
    const dimsRaw = dimsInput.value.trim();
    const dims = dimsRaw.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    
    // 2) parse r
    const r = parseInt(rValue.value, 10) || 0;
    updateDegreeTogglesFlag(r);

    // If r=0 => just show partial flag’s Hodge diamond
    if (r === 0) {
      const diamond = hodgeFlag(dims);
      renderDiamond(diamond,
        `Hodge diamond for partial flag [${dims}] (r=0)`,
        diamondContainer
      );
      return;
    }

    // If r>0:
    if (dims.length === 2) {
      // Actually a Grassmannian -> show an error or direct user to the Grassmannian tab
      diamondContainer.innerHTML = `<p class="error">For len(dims)=2, use the Grassmannian calculator. Not implemented here.</p>`;
      return;
    }

    if (dims.length > 3) {
      // Not supported
      diamondContainer.innerHTML = `<p class="error">Hodge numbers for len(dims) > 3 not yet supported.</p>`;
      return;
    }

    if (dims.length !== 3) {
      diamondContainer.innerHTML = `<p class="error">Invalid dims. len(dims) should be 3 or less for partial flags. Got [${dims}].</p>`;
      return;
    }

    // Now we do len(dims)=3. We'll parse each hypersurface's (d_i,e_i).
    const rowDivs = Array.from(degreeTogglesContainer.children);
    if (rowDivs.length !== r) {
      diamondContainer.innerHTML = `<p class="error">Mismatch in # of multi-degree rows vs. r. Try again.</p>`;
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
        diamondContainer.innerHTML = `<p class="error">Each hypersurface must have 2 integers: (d_i,e_i). Found: ${input.value}.</p>`;
        return;
      }
      dVals.push(arr[0]);
      eVals.push(arr[1]);
    }

    // Build the JSON key "[dims],r"
    const key = `[${dims.join(", ")}],${r}`;
    if (!flagHodgeData || !(key in flagHodgeData)) {
      diamondContainer.innerHTML = `<p class="error">No data in flag_hodge_numbers_factored.json for "${key}".</p>`;
      return;
    }
    const hodgePolys = flagHodgeData[key];
    // These polynomials represent the first half (or partial) of the middle row => must mirror them.

    // Compute dimension of the partial flag: 
    let dimF = 0;
    const n = dims.reduce((a,b) => a+b,0);
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

    // Evaluate each polynomial in hodgePolys => yields an array of half-row values
    let halfValues = hodgePolys.map(polyStr => evaluateFlagPolynomial(polyStr, dVals, eVals));
    // Mirror them to build the entire middle row
    // For a dimensionCI = d, middle row has d+1 elements. 
    // The JSON typically stores the first ⌊(d+1)/2⌋ or something. We'll assume halfValues = that half. 
    // We must reconstruct the entire row. Let's do a typical approach: 
    const middleRowLength = dimensionCI + 1;
    // If middleRowLength is even => the "middle" row is symmetrical around the center. 
    // If middleRowLength is odd => same idea. We'll do the typical "grassmannian" style approach:
    // e.g. if dimensionCI=4 => row has 5 elements => halfValues could be the 3 left elements? Then we mirror the first 2. 
    // We'll define a helper:
    function buildFullRowFromHalf(halfVals, neededLength) {
      // Suppose neededLength = 5, halfVals = [H0, H1, H2]. Then we do middleRow = [H0, H1, H2, H1, H0].
      // If neededLength=4, halfVals = [A,B], => row=[A,B,B,A].
      const arr = [...halfVals];
      // If neededLength is odd => the last element in halfVals is the real "center." We'll mirror everything except that last one
      // If neededLength is even => there's no single center element => mirror everything. 
      const isOdd = (neededLength % 2===1);
      if (isOdd) {
        // skip the last element in arr (the middle), mirror the rest
        const mirrorPart = arr.slice(0, arr.length-1).reverse();
        return arr.concat(mirrorPart);
      } else {
        // if even => we mirror everything
        const mirrorPart = arr.slice().reverse();
        return arr.concat(mirrorPart);
      }
    }

    let fullMiddleRowValues = buildFullRowFromHalf(halfValues, middleRowLength);

    // Build base diamond for "flag" alone (r=0)
    const baseDiamond = hodgeFlag(dims);
    // That has 2*dimF+1 rows. We'll splice in the middle row (#dimF) with the computed row. 
    // Then we produce final diamond with 2*dimensionCI+1 rows. 
    const finalDiamond = [];
    for (let i=0; i< totalRows; i++){
      const rowSize = (i<=dimensionCI)? (i+1) : (2*dimensionCI-i+1);
      const rowArr = [];
      for (let j=0; j<rowSize; j++){
        if (i < dimensionCI){
          // use baseDiamond if it exists. i < dimF => we can copy baseDiamond[i][j], else 0.
          if (i< dimF) {
            rowArr.push(baseDiamond[i]?.[j] || 0);
          } else {
            rowArr.push(0);
          }
        } else if (i===dimensionCI){
          // middle row => sum baseDiamond[dimF][j] with fullMiddleRowValues[j]
          let baseVal = 0n;
          if (dimF < baseDiamond.length) {
            baseVal = BigInt(baseDiamond[dimF]?.[j] || 0);
          }
          let addedVal = 0n;
          if (fullMiddleRowValues[j]) {
            addedVal = BigInt(fullMiddleRowValues[j]);
          }
          rowArr.push( (baseVal + addedVal).toString() );
        } else {
          // i>dimensionCI => mirror row => mirrorI=2*dimensionCI - i
          const mirrorI = 2*dimensionCI - i;
          if (mirrorI<dimF) {
            rowArr.push(baseDiamond[mirrorI]?.[j] || 0);
          } else {
            rowArr.push(0);
          }
        }
      }
      finalDiamond.push(rowArr);
    }

    renderDiamond(
      finalDiamond,
      `Hodge diamond for a complete intersection in Fl(${dims}) with r=${r} hypersurfaces`,
      diamondContainer
    );
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

  // Sync slider <-> number input
  syncSliderAndTextbox(rSlider, rValue, updateDiamondFlag, 10);

  // Listen for changes in dims
  dimsInput.addEventListener("input", updateDiamondFlag);

  // On page load
  updateDiamondFlag();

  // Make it available for the general toggle logic in scripts.js
  document.getElementById("flag-container").updateCalculator = updateDiamondFlag;
});
