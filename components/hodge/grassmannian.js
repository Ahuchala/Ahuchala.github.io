import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";

document.addEventListener("DOMContentLoaded", () => {
    const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
    const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
    const nValueGrassmannian = document.getElementById("n-value-grassmannian");
    const kValueGrassmannian = document.getElementById("k-value-grassmannian");
    const diamondContainerGrassmannian = document.getElementById("diamond-container-grassmannian");

    const syncSliderAndTextbox = (slider, textbox, onChange, maxValue = 50) => {
        slider.addEventListener("input", () => {
            textbox.value = slider.value;
            onChange();
        });

        textbox.addEventListener("input", () => {
            const value = Math.max(1, Math.min(parseInt(textbox.value) || 1, maxValue));
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

    const updateDiamondGrassmannian = () => {
        const n = parseInt(nValueGrassmannian.value);
        const k = parseInt(kValueGrassmannian.value);

        // Clear diamond container
        diamondContainerGrassmannian.innerHTML = "";

        try {
            const hodgeDiamond = hodgeGrassmannian(k, n);
            const totalRows = hodgeDiamond.length;

            for (let i = 0; i < totalRows; i++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                // Number of values in this row
                const numValues = hodgeDiamond[i].length;



                // Add Hodge number values
                for (let j = 0; j < numValues; j++) {
                    const valueCell = document.createElement("span");
                    valueCell.className = "diamond-value";
                    valueCell.innerText = hodgeDiamond[i][j] || "0";
                    row.appendChild(valueCell);
                }

                diamondContainerGrassmannian.appendChild(row);
            }
        } catch (error) {
            console.error(error.message);
            const errorMessage = document.createElement("p");
            errorMessage.innerText = `Error: ${error.message}`;
            diamondContainerGrassmannian.appendChild(errorMessage);
        }
    };

    // Sync sliders and textboxes for Grassmannian
    syncSliderAndTextbox(nSliderGrassmannian, nValueGrassmannian, updateDiamondGrassmannian);
    syncSliderAndTextbox(kSliderGrassmannian, kValueGrassmannian, updateDiamondGrassmannian);

    updateDiamondGrassmannian(); // Initialize Hodge diamond
});
