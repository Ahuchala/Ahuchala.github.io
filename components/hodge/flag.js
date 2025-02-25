document.addEventListener("DOMContentLoaded", () => {
    const dimsInput = document.getElementById("dims-input");
    const rSlider = document.getElementById("r-slider-flag");
    const rValue = document.getElementById("r-value-flag");
    const degreeToggles = document.getElementById("degree-toggles-flag");
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
  
    function updateDiamondFlag() {
      const dimsRaw = dimsInput.value.trim();
      const dims = dimsRaw.split(",")
                           .map(s => parseInt(s.trim()))
                           .filter(n => !isNaN(n));
      const r = parseInt(rValue.value, 10) || 0;
      updateDegreeTogglesFlag(r);
  
      let degrees = [];
      Array.from(degreeToggles.children).forEach(container => {
        const input = container.querySelector("input");
        if (input) degrees.push(parseInt(input.value));
      });
  
      const multidegreeStr = degrees.length > 0 ? "(" + degrees.join(", ") + ")" : "";
      const dimsStr = dims.length > 0 ? "[" + dims.join(", ") + "]" : "";
      flagDescription.innerHTML = `Hodge diamond of a complete intersection of multidegree ${multidegreeStr} for partial flag of dimensions ${dimsStr}`;
  
      // Render a placeholder diamond of zeros.
      const placeholderDimension = 2;
      const rows = 2 * placeholderDimension + 1;
      diamondContainer.innerHTML = "";
      for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "diamond-row";
        const numCells = i <= placeholderDimension ? i + 1 : rows - i;
        for (let j = 0; j < numCells; j++) {
          const cell = document.createElement("span");
          cell.className = "diamond-value";
          cell.innerText = "0";
          rowDiv.appendChild(cell);
        }
        diamondContainer.appendChild(rowDiv);
      }
    }
  
    syncSliderAndTextbox(rSlider, rValue, updateDiamondFlag, 10);
    dimsInput.addEventListener("input", updateDiamondFlag);
  
    // Initial (even if hidden) update.
    updateDiamondFlag();
  
    // Register the update function with the container.
    document.getElementById("flag-container").updateCalculator = updateDiamondFlag;
  });
  