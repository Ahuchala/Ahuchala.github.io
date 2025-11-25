import { hodgeAbelianVariety } from "/components/hodge/abelianVarietyHodgeNumbers.js";

document.addEventListener("DOMContentLoaded", () => {
    const gSlider = document.getElementById("g-slider");
    const gValue = document.getElementById("g-value");
    const diamondContainerAbelian = document.getElementById("diamond-container-abelian");
    const presetButtonsAbelian = document.getElementById("preset-buttons-abelian");

    // --- allow blank textbox while typing ---
    const syncSliderAndTextbox = (slider, textbox, onChange, maxValue = 50) => {

        // slider → textbox
        slider.addEventListener("input", () => {
            textbox.value = slider.value;
            onChange();
        });

        // textbox typing (allow blank)
        textbox.addEventListener("input", () => {
            const raw = textbox.value.trim();

            // blank: show placeholder & don't move slider
            if (raw === "") {
                diamondContainerAbelian.innerHTML =
                  `<p class="placeholder">Enter a genus g to see the Hodge diamond.</p>`;
                return;
            }

            // numeric:
            let v = parseInt(raw);
            if (!Number.isFinite(v)) v = 1;
            v = Math.max(1, Math.min(v, maxValue));

            textbox.value = v;
            slider.value = Math.min(v, slider.max);

            onChange();
        });

        // on blur: normalize blank → 1
        textbox.addEventListener("blur", () => {
            if (textbox.value.trim() === "") textbox.value = "1";
            let v = parseInt(textbox.value);
            if (!Number.isFinite(v)) v = 1;
            v = Math.max(1, Math.min(v, maxValue));
            textbox.value = v;
            slider.value = Math.min(v, slider.max);
            onChange();
        });
    };

    const updateDiamondAbelian = () => {
        const g = parseInt(gValue.value);

        if (!Number.isFinite(g) || g < 1) {
            diamondContainerAbelian.innerHTML =
              `<p class="placeholder">Enter a genus g to see the Hodge diamond.</p>`;
            return;
        }

        const diamond = hodgeAbelianVariety(g);
        diamondContainerAbelian.innerHTML = "";

        const totalRows = 2 * g + 1;

        for (let i = 0; i < totalRows; i++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const numValues = g + 1 - Math.abs(g - i);

            for (let j = 0; j < numValues; j++) {
                const cell = document.createElement("span");
                cell.className = "diamond-value";
                cell.innerText = diamond[i]?.[j] ?? "0";
                row.appendChild(cell);
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
    updateDiamondAbelian();
});
