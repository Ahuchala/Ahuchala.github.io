document.addEventListener("DOMContentLoaded", () => {
    const dimsInput = document.getElementById("dims-input");
    const rSlider = document.getElementById("r-slider-flag");
    const rValue = document.getElementById("r-value-flag");
    const degreeToggles = document.getElementById("degree-toggles-flag");
    const diamondContainer = document.getElementById("diamond-container-flag");
    const flagDescription = document.getElementById("flag-description");
  
    // Sync a slider and its corresponding number input.
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
  
    // Update the degree toggles based on the number of hypersurfaces (r).
    function updateDegreeTogglesFlag(r) {
      const currentCount = degreeToggles.children.length;
      if (r > currentCount) {
        for (let i = currentCount; i < r; i++) {
          const container = document.createElement("div");
          container.className = "degree-toggle";
          const label = document.createElement("label");
          label.innerText = `Degree of Hypersurface ${i + 1}:`;
          const input = document.createElement("input");
          input.type = "number";
          input.min = "1";
          input.max = "50";
          input.value = "2";
          input.className = "hodge-input";
          input.addEventListener("input", updateDiamondFlag);
          container.appendChild(label);
          container.appendChild(input);
          degreeToggles.appendChild(container);
        }
      } else if (r < currentCount) {
        for (let i = currentCount - 1; i >= r; i--) {
          degreeToggles.removeChild(degreeToggles.children[i]);
        }
      }
    }
  
    // Update the flag variety diamond and its title.
    function updateDiamondFlag() {
      // Parse the list of dimensions from the textbox (e.g. "1,1,1,1")
      const dimsRaw = dimsInput.value.trim();
      const dimsArray = dimsRaw.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  
      // Compute dim F = ∑₍i<j₎ dᵢ*dⱼ.
      let dimF = 0;
      for (let i = 0; i < dimsArray.length; i++) {
        for (let j = i + 1; j < dimsArray.length; j++) {
          dimF += dimsArray[i] * dimsArray[j];
        }
      }
  
      // Parse the number of hypersurfaces r.
      const r = parseInt(rValue.value, 10) || 0;
      updateDegreeTogglesFlag(r);
  
      // Gather the degree values.
      let degrees = [];
      Array.from(degreeToggles.children).forEach(container => {
        const input = container.querySelector("input");
        if (input) degrees.push(parseInt(input.value));
      });
  
      // Update the description title.
      const multidegreeStr = degrees.length > 0 ? "(" + degrees.join(", ") + ")" : "";
      const dimsStr = dimsArray.length > 0 ? "[" + dimsArray.join(", ") + "]" : "";
      flagDescription.innerHTML = `Hodge diamond of a complete intersection of multidegree ${multidegreeStr} for partial flag of dimensions ${dimsStr}`;
  
      // Compute the number of rows: 2*(dimF - r) + 1.
      let d = dimF - r;
      if (d < 0) d = 0;
      let rows = 2 * d + 1;
      if (rows < 1) rows = 1;
  
      // Build a symmetric diamond of zeros.
      diamondContainer.innerHTML = "";
      for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "diamond-row";
        // For 0 ≤ i ≤ d, use i+1 entries; for i > d, use rows - i entries.
        let numCells = (i <= d) ? i + 1 : rows - i;
        for (let j = 0; j < numCells; j++) {
          const cell = document.createElement("span");
          cell.className = "diamond-value";
          cell.innerText = "0";
          rowDiv.appendChild(cell);
        }
        diamondContainer.appendChild(rowDiv);
      }
    }
  
    // Set up syncing for the hypersurface slider and number input.
    syncSliderAndTextbox(rSlider, rValue, updateDiamondFlag, 10);
    dimsInput.addEventListener("input", updateDiamondFlag);
  
    // Initial update.
    updateDiamondFlag();
  
    // Register the update function with the container for generic toggle logic.
    document.getElementById("flag-container").updateCalculator = updateDiamondFlag;
  });
  
  import { hodgeFlag } from "/components/hodge/flagHodge.js";

document.addEventListener("DOMContentLoaded", () => {
  const dimsInput = document.getElementById("dims-input");
  const diamondContainer = document.getElementById("diamond-container-flag");
  const flagDescription = document.getElementById("flag-description");

  function updateDiamondFlag() {
    // Parse the list of dimensions from the textbox (expected as "1,1,1,1", etc.)
    const dimsRaw = dimsInput.value.trim();
    const dims = dimsRaw.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    // For now, assume r = 0 and compute the flag Hodge diamond.
    const diamond = hodgeFlag(dims);

    // Update the description title.
    flagDescription.innerHTML = `Hodge diamond for partial flag of dimensions [${dims.join(", ")}]`;

    // Render the diamond.
    diamondContainer.innerHTML = "";
    diamond.forEach(row => {
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

  dimsInput.addEventListener("input", updateDiamondFlag);

  // Initial update.
  updateDiamondFlag();

  // Register the update function with the container (if using generic toggle logic).
  document.getElementById("flag-container").updateCalculator = updateDiamondFlag;
});
