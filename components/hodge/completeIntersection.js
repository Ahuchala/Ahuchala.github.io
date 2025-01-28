import { hodgeCompleteIntersection } from "/components/hodge/completeIntersectionHodgeNumbers.js";

document.addEventListener("DOMContentLoaded", () => {
    const nSlider = document.getElementById("n-slider");
    const kSlider = document.getElementById("k-slider");
    const nValue = document.getElementById("n-value");
    const kValue = document.getElementById("k-value");
    const degreeToggles = document.getElementById("degree-toggles");
    const diamondContainer = document.getElementById("diamond-container");

    const presetButtons = document.querySelectorAll(".preset-button");
    let lastUserSetK = parseInt(kSlider.value); // Tracks the last user-set value of `k`

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

    const updateKSlider = () => {
        const n = parseInt(nValue.value) || 1;
        const newK = Math.min(lastUserSetK, n); // Ensure `k` is within valid bounds
        kSlider.max = Math.min(10, n); // `k` slider maxes out at `n` or 10 (UI cap)
        kSlider.value = newK; // Update the slider value
        kValue.value = newK; // Sync textbox
        updateDegreeToggles(newK); // Update degree toggles to match new `k`
    };
    

    const updateDegreeToggles = (k) => {
        const currentCount = degreeToggles.children.length;
        if (k > currentCount) {
            for (let i = currentCount; i < k; i++) {
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

                input.addEventListener("input", updateDiamond);

                toggleContainer.appendChild(label);
                toggleContainer.appendChild(input);
                degreeToggles.appendChild(toggleContainer);
            }
        } else if (k < currentCount) {
            for (let i = currentCount - 1; i >= k; i--) {
                degreeToggles.children[i].remove();
            }
        }
    };

    const updateDiamond = () => {
        const n = parseInt(nValue.value);
        const k = parseInt(kValue.value);
        const rows = 2 * (n - k) + 1;
        const targetRowIndex = n - k;

        diamondContainer.innerHTML = "";

        if (k === n) {
            const degrees = Array.from(degreeToggles.querySelectorAll(".hodge-input"))
                .map((input) => parseInt(input.value));
            const product = degrees.reduce((acc, degree) => acc * degree, 1);

            const singleRow = document.createElement("div");
            singleRow.className = "diamond-row";

            const value = document.createElement("span");
            value.className = "diamond-value";
            value.innerText = product;

            singleRow.appendChild(value);
            diamondContainer.appendChild(singleRow);
            return;
        }

        if (k === 0) {
            for (let j = 0; j < rows; j++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
                const spaces = (rows - elements) / 2;

                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                for (let i = 0; i < elements; i++) {
                    const valEl = document.createElement("span");
                    valEl.className = "diamond-value";
                    const condition = 2 * i === Math.min(j, 2 * (n - k) - j);
                    valEl.innerText = condition ? "1" : "0";
                    row.appendChild(valEl);
                }

                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                diamondContainer.appendChild(row);
            }
            return;
        }

        const degrees = Array.from(degreeToggles.querySelectorAll(".hodge-input"))
            .map((input) => parseInt(input.value));

        const hodgeNumbers = hodgeCompleteIntersection(degrees, n);

        for (let j = 0; j < rows; j++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
            const spaces = (rows - elements) / 2;

            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("span");
                space.className = "diamond-space";
                row.appendChild(space);
            }

            for (let i = 0; i < elements; i++) {
                const valEl = document.createElement("span");
                valEl.className = "diamond-value";

                if (j === targetRowIndex) {
                    const symmetricIndex = targetRowIndex - i;
                    valEl.innerText = hodgeNumbers[i] || hodgeNumbers[symmetricIndex] || 0;
                } else {
                    const condition = 2 * i === Math.min(j, 2 * (n - k) - j);
                    valEl.innerText = condition ? "1" : "0";
                }

                row.appendChild(valEl);
            }

            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("span");
                space.className = "diamond-space";
                row.appendChild(space);
            }

            diamondContainer.appendChild(row);
        }
    };

    const loadPreset = (n, k, degrees) => {
        nValue.value = n;
        nSlider.value = Math.min(n, nSlider.max);
        lastUserSetK = k; // Remember the preset `k`
        updateKSlider();
        updateDegreeToggles(k);

        const inputs = degreeToggles.querySelectorAll(".hodge-input");
        degrees.forEach((deg, i) => {
            if (inputs[i]) {
                inputs[i].value = deg;
            }
        });

        updateDiamond();
    };

    presetButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Check if the button has the required attributes for complete intersections

            if (!button.dataset.n || !button.dataset.k || !button.dataset.degrees) return;

            const n = parseInt(button.dataset.n);
            const k = parseInt(button.dataset.k);
            const degrees = button.dataset.degrees.split(",").map(Number);
            loadPreset(n, k, degrees);
        });
    });

    // Initialize sliders and textboxes
    syncSliderAndTextbox(nSlider, nValue, () => {
        updateKSlider();
        updateDiamond();
    }, 50);

    syncSliderAndTextbox(kSlider, kValue, () => {
        lastUserSetK = parseInt(kValue.value); // Update remembered `k`
        updateDegreeToggles(parseInt(kValue.value));
        updateDiamond();
    });

    // Default preset
    loadPreset(4, 2, [3, 2]);
});
