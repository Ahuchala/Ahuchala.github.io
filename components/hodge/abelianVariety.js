import { hodgeAbelianVariety } from "/components/hodge/abelianVarietyHodgeNumbers.js";

document.addEventListener("DOMContentLoaded", () => {
    const gSlider = document.getElementById("g-slider");
    const gValue = document.getElementById("g-value");
    const diamondContainerAbelian = document.getElementById("diamond-container-abelian");
    const presetButtonsAbelian = document.getElementById("preset-buttons-abelian");


    const syncSliderAndTextbox = (slider, textbox, onChange, maxValue = 50) => {
        slider.addEventListener("input", () => {
            textbox.value = slider.value;
            onChange();
        });

        textbox.addEventListener("input", () => {
            const value = Math.max(1, Math.min(parseInt(textbox.value) || 1, maxValue));
            textbox.value = value;
            slider.value = Math.min(value, slider.max);
            onChange();
        });
    };

    const updateDiamondAbelian = () => {
        const g = parseInt(gValue.value);
        const diamond = hodgeAbelianVariety(g); // Get the Hodge numbers

        diamondContainerAbelian.innerHTML = "";

        const totalRows = 2 * g + 1; // Total rows in the diamond

        for (let i = 0; i < totalRows; i++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            // Number of values in this row
            const numValues = g + 1 - Math.abs(g - i);

            // Add spaces for centering the diamond row
            // const spaces = Math.abs(g - i);
            // for (let s = 0; s < spaces; s++) {
            //     const space = document.createElement("span");
            //     space.className = "diamond-space";
            //     row.appendChild(space);
            // }

            // Add Hodge number values
            for (let j = 0; j < numValues; j++) {
                const valueCell = document.createElement("span");
                valueCell.className = "diamond-value";
                valueCell.innerText = diamond[i]?.[j] || "0"; // Use the computed diamond values
                row.appendChild(valueCell);
            }

            diamondContainerAbelian.appendChild(row);
        }
        
    };

    const loadPresetAbelian = (g) => {
        gValue.value = g;
        gSlider.value = Math.min(g, gSlider.max);
        updateDiamondAbelian();
    };

    presetButtonsAbelian.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("preset-button")) {
            const g = parseInt(target.dataset.g);
            loadPresetAbelian(g);
        }
    });

    syncSliderAndTextbox(gSlider, gValue, updateDiamondAbelian);
    updateDiamondAbelian(); // Initialize on page load
    
});
