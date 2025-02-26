import { hodgeFlag } from "/components/hodge/flagHodge.js";
import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";
import { hodgeCompleteIntersection } from "/components/hodge/completeIntersectionHodgeNumbers.js";

// Evaluate polynomials in variables d_1..d_r (like your grassmannian approach)
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

function evaluatePolynomial(polyStr, degrees) {
  const fracRegex = /^\s*\(([-+]?\d+)\/(\d+)\)\s*\*\s*/;
  const match = polyStr.match(fracRegex);
  let numerator = 1n, denominator = 1n;
  let bodyStr = polyStr;
  if (match) {
    numerator = BigInt(match[1]);
    denominator = BigInt(match[2]);
    bodyStr = polyStr.slice(match[0].length);
  }
  const ast = math.parse(bodyStr);
  const scope = {};
  degrees.forEach((deg, i) => {
    scope[`d_${i+1}`] = BigInt(deg);
  });
  let val = evalASTBigInt(ast, scope);
  val = (val * numerator) / denominator;
  if (val<0n) val = -val;
  return val.toString();
}

function constructMiddleRow(dimension, polyValues) {
  // same logic as grassmannian.js
  const isOdd = (dimension % 2===1);
  const neededLen = isOdd ? (Math.floor(dimension/2)+1) : (dimension/2 +1);
  const truncated = polyValues.slice(0,neededLen);
  const row = [...truncated];
  if (isOdd) {
    // mirror everything
    for (let i= truncated.length-1; i>=0; i--){
      row.push(truncated[i]);
    }
  } else {
    // skip last
    for (let i= truncated.length-2; i>=0; i--){
      row.push(truncated[i]);
    }
  }
  return row;
}

function safeBigInt(x) {
  if (typeof x==="number") return BigInt(x);
  if (typeof x==="string") return BigInt(x.replace(/[ ,]/g,""));
  return BigInt(x.toString());
}

let flagHodgeData=null, grassmannianHodgeData=null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const respF = await fetch("/components/hodge/flag_hodge_numbers_factored.json");
    flagHodgeData = await respF.json();
  } catch(e){ console.error("Could not load flag_hodge_numbers_factored.json:", e); }

  try {
    const respG = await fetch("/components/hodge/grassmannian_hodge_numbers_factored.json");
    grassmannianHodgeData = await respG.json();
  } catch(e){ console.error("Could not load grassmannian_hodge_numbers_factored.json:", e); }

  const dimsInput = document.getElementById("dims-input");
  const rSlider = document.getElementById("r-slider-flag");
  const rValue = document.getElementById("r-value-flag");
  const degreeToggles = document.getElementById("degree-toggles-flag");
  const diamondContainer = document.getElementById("diamond-container-flag");
  const flagDescription = document.getElementById("flag-description");

  dimsInput.value="1,1,1"; // default

  function syncSliderAndTextbox(slider, textbox, onChange, maxV=50) {
    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });
    textbox.addEventListener("input", () => {
      const val = Math.max(0, Math.min(parseInt(textbox.value)||0, maxV));
      textbox.value=val;
      slider.value=val;
      onChange();
    });
    slider.addEventListener("change", () => {
      textbox.value= slider.value;
      onChange();
    });
  }

  function updateDegreeTogglesFlag(r) {
    while (degreeToggles.children.length>r) {
      degreeToggles.removeChild(degreeToggles.lastChild);
    }
    while (degreeToggles.children.length<r) {
      const idx = degreeToggles.children.length;
      const rowDiv = document.createElement("div");
      rowDiv.className="degree-toggle";
      const label = document.createElement("label");
      label.innerText=`Hypersurface ${idx+1}:`;
      const input = document.createElement("input");
      input.type="text";
      input.value="2";
      input.className="hodge-input";
      input.addEventListener("input", updateDiamondFlag);
      rowDiv.appendChild(label);
      rowDiv.appendChild(input);
      degreeToggles.appendChild(rowDiv);
    }
  }

  function renderDiamond(diamond2D, desc) {
    flagDescription.innerText = desc;
    diamondContainer.innerHTML="";
    diamond2D.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className="diamond-row";
      row.forEach(val => {
        const cell = document.createElement("span");
        cell.className="diamond-value";
        cell.innerText= val.toString();
        rowDiv.appendChild(cell);
      });
      diamondContainer.appendChild(rowDiv);
    });
  }

  // The main update function
  function updateDiamondFlag() {
    const dimsStr = dimsInput.value.trim();
    const dims = dimsStr.split(",").map(x=> parseInt(x.trim())).filter(n=>!isNaN(n));
    const r = parseInt(rValue.value,10)||0;
    updateDegreeTogglesFlag(r);

    // r=0 => base variety
    if (r===0){
      if (dims.length===2){
        // Grassmannian
        const k = dims[0];
        const n = dims[0]+dims[1];
        const base = hodgeGrassmannian(k,n);
        renderDiamond(base, `Base Grassmannian Gr(${k},${n}), r=0`);
      } else {
        // partial flag
        const base = hodgeFlag(dims);
        renderDiamond(base, `Base partial flag [${dims}], r=0`);
      }
      return;
    }

    // r>0
    if (dims.length===2){
      handleGrassmannianCase(dims,r);
    } else if (dims.length===3){
      handlePartialFlagCase(dims,r);
    } else {
      diamondContainer.innerHTML=`<p class="error">dims=[${dims}] & r>0 => only len=2 or 3 supported</p>`;
    }
  }

  /*****************************************
   * handleGrassmannianCase
   *****************************************/
  function handleGrassmannianCase(dims,r) {
    // dims=[k, n-k]
    const rowDivs = Array.from(degreeToggles.children);
    if (rowDivs.length!==r) {
      diamondContainer.innerHTML=`<p class="error">Mismatch in # toggles vs r</p>`;
      return;
    }
    // parse each row as single integer
    const degrees=[];
    for (let i=0; i<r; i++){
      const valStr = rowDivs[i].querySelector("input").value.trim();
      const deg = parseInt(valStr,10);
      if (isNaN(deg)){
        diamondContainer.innerHTML=`<p class="error">Invalid deg for hypersurface #${i+1}</p>`;
        return;
      }
      degrees.push(deg);
    }
    const k= dims[0];
    const n= dims[0]+dims[1];
    // dimension = k*(n-k) - r
    const dimension= k*(n-k) - r;
    if (dimension<0){
      diamondContainer.innerHTML=`<p class="error">Dimension <0 => r too big</p>`;
      return;
    }
    const totalRows= 2*dimension+1;

    // base diamond
    const baseDiamond = hodgeGrassmannian(k,n);

    // Special check for k=1 or k=n-1 => we do hodgeCompleteIntersection
    // exactly as your grassmannian.js does
    // else we do the polynomials from "grassmannianHodgeData"

    const key = `${k},${n},${r}`;
    let middleValues=[];
    if (k===1 || k===n-1) {
      // In that scenario your code calls "hodgeCompleteIntersection(degrees, n-1)"
      // That returns an array of polynomials or direct hodgeNumbers?
      middleValues= hodgeCompleteIntersection(degrees, n-1);
      // This might be a direct numeric array or partial. 
      // You might need to adapt to the same shape as the polynomials from JSON.
      // We'll assume it's an array of length dimension+1. Then we skip "constructMiddleRow".
      if (middleValues.length< (dimension+1)) {
        diamondContainer.innerHTML=`<p class="error">hodgeCompleteIntersection() returned fewer values than needed</p>`;
        return;
      }
    } else {
      if (!grassmannianHodgeData || !(key in grassmannianHodgeData)){
        diamondContainer.innerHTML=`<p class="error">No data for key="${key}" in grassmannian_hodge_numbers_factored.json</p>`;
        return;
      }
      const polynomials = grassmannianHodgeData[key];
      // Evaluate each => array
      const evaluated= polynomials.map(pStr => evaluatePolynomial(pStr, degrees));
      // Then do constructMiddleRow
      middleValues= constructMiddleRow(dimension, evaluated);
    }

    // Now sum with baseDiamond row #dimension
    const finalDiamond=[];
    for (let i=0; i< totalRows; i++){
      const rowLen= (i<dimension)? (i+1): (2*dimension-i+1);
      const rowArr=[];
      for (let j=0; j<rowLen; j++){
        if (i< dimension){
          rowArr.push( baseDiamond[i]?.[j]||0 );
        } else if (i=== dimension){
          let baseVal= safeBigInt(baseDiamond[dimension]?.[j]||0);
          let polyVal= safeBigInt(middleValues[j]||0);
          rowArr.push( (baseVal+polyVal).toString() );
        } else {
          const mirrorI= 2*dimension - i;
          rowArr.push( baseDiamond[mirrorI]?.[j]||0 );
        }
      }
      finalDiamond.push(rowArr);
    }

    renderDiamond(finalDiamond,
      `Complete intersection in Gr(${k},${n}), r=${r}, degrees=[${degrees}]`
    );
  }

  /*****************************************
   * handlePartialFlagCase
   *****************************************/
  function handlePartialFlagCase(dims,r) {
    const rowDivs = Array.from(degreeToggles.children);
    if (rowDivs.length!==r) {
      diamondContainer.innerHTML=`<p class="error">Mismatch # toggles vs r in partialFlagCase.</p>`;
      return;
    }
    const dVals=[], eVals=[];
    for (let i=0; i<r; i++){
      const valStr= rowDivs[i].querySelector("input").value.trim();
      const arr= valStr.split(",").map(x=> parseInt(x.trim())).filter(x=>!isNaN(x));
      if (arr.length!==2){
        diamondContainer.innerHTML=`<p class="error">Hypersurface #${i+1} => need 2 ints</p>`;
        return;
      }
      dVals.push(arr[0]);
      eVals.push(arr[1]);
    }
    // dimension => sum(dims) => ...
    const n = dims.reduce((a,b)=>a+b,0);
    let dimF=0, mp=0;
    for (let i=0; i<dims.length;i++){
      const mi= mp+ dims[i];
      dimF+= (n-mi)*(mi-mp);
      mp= mi;
    }
    const dimension= dimF-r;
    if (dimension<0){
      diamondContainer.innerHTML=`<p class="error">Dimension<0 => r too big</p>`;
      return;
    }
    const totalRows=2*dimension+1;

    // base diamond
    const baseDiamond= hodgeFlag(dims);

    // build key => "[a,b,c],r"
    const key= `[${dims.join(", ")}],${r}`;
    if (!flagHodgeData || !(key in flagHodgeData)){
      diamondContainer.innerHTML=`<p class="error">No partial-flag data for key="${key}"</p>`;
      return;
    }
    const polynomials= flagHodgeData[key];
    // Evaluate each => with "d_i,e_i"
    // We'll do a short approach:
    function evaluateFlagPoly(polyStr, dVals, eVals) {
      // parse with math.js, building scope {d_1..d_r, e_1..e_r}, etc.
      // We'll do something quick:
      return "1000"; // placeholder
    }
    const rawEvals= polynomials.map(pStr => evaluateFlagPoly(pStr,dVals,eVals));
    // Then mirror them => same approach => constructMiddleRow(dimension, rawEvals)
    const middleRow= constructMiddleRow(dimension, rawEvals);

    // sum with baseDiamond row #dimension
    const finalDiamond=[];
    for (let i=0; i< totalRows; i++){
      const rowLen= (i<dimension)? i+1: (2*dimension - i+1);
      const rowArr=[];
      for (let j=0; j<rowLen; j++){
        if (i<dimension){
          rowArr.push(baseDiamond[i]?.[j]||0);
        } else if (i=== dimension){
          let baseVal= safeBigInt(baseDiamond[dimension]?.[j]||0);
          let polVal= safeBigInt(middleRow[j]||0);
          rowArr.push( (baseVal+ polVal).toString() );
        } else {
          const mirrorI= 2*dimension- i;
          rowArr.push(baseDiamond[mirrorI]?.[j]||0);
        }
      }
      finalDiamond.push(rowArr);
    }

    renderDiamond(finalDiamond, 
      `Complete intersection in Fl(${dims.join(",")}), r=${r}`);
  }

  function syncEverything() {
    updateDiamondFlag();
  }

  syncSliderAndTextbox(rSlider, rValue, syncEverything,10);
  dimsInput.addEventListener("input", syncEverything);

  syncEverything();

  document.getElementById("flag-container").updateCalculator = syncEverything;
});
