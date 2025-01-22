import {hodgeAbelianVariety} from "/components/hodge/abelianVarietyHodgeNumbers.js"

document.addEventListener("DOMContentLoaded", () => {
    const gSlider = document.getElementById("g-slider");
    const gValue = document.getElementById("g-value");
    const diamondContainerAbelian = document.getElementById("diamond-container-abelian");

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
        diamondContainerAbelian.innerHTML = "";

        for (let i = 0; i <= g; i++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            for (let j = 0; j <= g; j++) {
                const valueCell = document.createElement("span");
                valueCell.className = "diamond-value";
                valueCell.innerText = "0";
                row.appendChild(valueCell);
            }

            diamondContainerAbelian.appendChild(row);
        }
    };

    syncSliderAndTextbox(gSlider, gValue, updateDiamondAbelian);
    updateDiamondAbelian();
});
