import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";

document.addEventListener("DOMContentLoaded", () => {
    const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
    const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
    const rSliderGrassmannian = document.getElementById("r-slider-grassmannian");
    const nValueGrassmannian = document.getElementById("n-value-grassmannian");
    const kValueGrassmannian = document.getElementById("k-value-grassmannian");
    const rValueGrassmannian = document.getElementById("r-value-grassmannian");
    const degreeTogglesGrassmannian = document.getElementById("degree-toggles-grassmannian");
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

    const updateDiamondGrassmannian = () => {
        const n = parseInt(nValueGrassmannian.value);
        const k = parseInt(kValueGrassmannian.value);
        const r = parseInt(rValueGrassmannian.value);
        const dimension = k * (n - k) - r;

        if (dimension < 0) {
            diamondContainerGrassmannian.innerHTML = `<p class="error">Error: Dimension is negative. Ensure \( r < k(n-k) \).</p>`;
            return;
        }

        const rows = 2 * dimension - 1;

        diamondContainerGrassmannian.innerHTML = "";

        // Get the full Hodge diamond for Gr(k, n)
        const fullHodgeNumbers = hodgeGrassmannian(k, n);

        for (let i = 0; i < rows; i++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const elements = i < dimension ? i + 1 : rows - i;

            for (let j = 0; j < elements; j++) {
                const valueCell = document.createElement("span");
                valueCell.className = "diamond-value";

                if (i < dimension) {
                    // Use values from hodgeGrassmannian for the first half
                    valueCell.innerText = fullHodgeNumbers[i]?.[j] || "0";
                } else {
                    // Mirror values using Serre duality for the second half
                    const mirrorRow = rows - i - 1;
                    valueCell.innerText = fullHodgeNumbers[mirrorRow]?.[j] || "0";
                }

                row.appendChild(valueCell);
            }

            diamondContainerGrassmannian.appendChild(row);
        }
    };

    // Sync sliders and textboxes for Grassmannian
    syncSliderAndTextbox(nSliderGrassmannian, nValueGrassmannian, updateDiamondGrassmannian);
    syncSliderAndTextbox(kSliderGrassmannian, kValueGrassmannian, updateDiamondGrassmannian);
    syncSliderAndTextbox(rSliderGrassmannian, rValueGrassmannian, () => {
        updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
        updateDiamondGrassmannian();
    });

    updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value)); // Initialize degree toggles
    updateDiamondGrassmannian(); // Initialize Hodge diamond
});
