import { hodge } from "./hodge.js";

document.addEventListener("DOMContentLoaded", async () => {
    const nSlider = document.getElementById("n-slider");
    const kSlider = document.getElementById("k-slider");
    const nValue = document.getElementById("n-value");
    const kValue = document.getElementById("k-value");
    const degreeToggles = document.getElementById("degree-toggles");
    const diamondContainer = document.getElementById("diamond-container");

    let lastUserSetK = parseInt(kSlider.value); // Track last user-set value of k

    // Create the set of numeric inputs for degrees
    const createDegreeToggles = (k) => {
        degreeToggles.innerHTML = ""; // Clear previous toggles

        for (let i = 0; i < k; i++) {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "degree-toggle";

            const label = document.createElement("label");
            label.innerText = `Degree of Hypersurface ${i + 1}:`;

            const input = document.createElement("input");
            input.type = "number";
            input.min = "1";
            input.max = "10";
            input.value = "2"; // Default degree
            input.className = "degree-input";

            // Recompute diamond when any degree changes
            input.addEventListener("input", updateDiamond);

            toggleContainer.appendChild(label);
            toggleContainer.appendChild(input);
            degreeToggles.appendChild(toggleContainer);
        }
    };

    // Main function to build/refresh the diamond
    const updateDiamond = () => {
        const n = parseInt(nSlider.value);
        const k = parseInt(kSlider.value);
        const rows = 2 * (n - k) + 1;
        const targetRowIndex = n - k; // row index where Hodge numbers appear

        nValue.innerText = n;
        kValue.innerText = k;
        diamondContainer.innerHTML = ""; // Clear previous diamond

        // 1) If k == n: Display a single number (product of degrees)
        if (k === n) {
            const degrees = Array.from(degreeToggles.querySelectorAll(".degree-input"))
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

        // 2) If k == 0: Standard Hodge diamond for projective space
        if (k === 0) {
            for (let j = 0; j < rows; j++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
                const spaces = (rows - elements) / 2;

                // Left spacing
                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                // Values for each element
                for (let i = 0; i < elements; i++) {
                    const valEl = document.createElement("span");
                    valEl.className = "diamond-value";
                    // apply the standard delta(i, j) rule
                    const condition = 2 * i === Math.min(j, 2 * (n - k) - j);
                    valEl.innerText = condition ? "1" : "0";
                    row.appendChild(valEl);
                }

                // Right spacing
                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                diamondContainer.appendChild(row);
            }
            return;
        }

        // 3) Otherwise (0 < k < n): compute Hodge numbers at runtime with hodge.js
        const degrees = Array.from(degreeToggles.querySelectorAll(".degree-input"))
            .map((input) => parseInt(input.value));

        // Call our new hodge() function
        const hodgeNumbers = hodge(degrees, n);
        // hodgeNumbers is typically length (n-k+1).

        // Build the diamond, using the middle row for hodgeNumbers
        for (let j = 0; j < rows; j++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
            const spaces = (rows - elements) / 2;

            // Left spacing
            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("span");
                space.className = "diamond-space";
                row.appendChild(space);
            }

            // Values
            for (let i = 0; i < elements; i++) {
                const valEl = document.createElement("span");
                valEl.className = "diamond-value";

                if (j === targetRowIndex) {
                    // Middle (dimension) row => show the computed Hodge # h^{i,n-k-i}
                    // For symmetry in the diamond, we also show the 'symmetricIndex' if i out of range
                    const symmetricIndex = targetRowIndex - i;
                    valEl.innerText = hodgeNumbers[i] || hodgeNumbers[symmetricIndex] || 0;
                } else {
                    // All other rows: default to a "delta" style for alignment
                    const condition = 2 * i === Math.min(j, 2 * (n - k) - j);
                    valEl.innerText = condition ? "1" : "0";
                }

                row.appendChild(valEl);
            }

            // Right spacing
            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("span");
                space.className = "diamond-space";
                row.appendChild(space);
            }

            diamondContainer.appendChild(row);
        }
    };

    const updateKSlider = () => {
        const n = parseInt(nSlider.value);

        // Adjust k-slider max to match n
        kSlider.max = n;

        // Dynamically set k to the last valid value or n, whichever is smaller
        if (lastUserSetK > n) {
            kSlider.value = n;
        } else {
            kSlider.value = lastUserSetK;
        }

        // Update degree toggles for the new k
        createDegreeToggles(parseInt(kSlider.value));
        updateDiamond();
    };

    // When n changes, we might need to clamp k
    nSlider.addEventListener("input", () => {
        updateKSlider();
    });

    // When k changes, record it, rebuild toggles & diamond
    kSlider.addEventListener("input", () => {
        lastUserSetK = parseInt(kSlider.value);
        createDegreeToggles(lastUserSetK);
        updateDiamond();
    });

    // Initialize on page load
    createDegreeToggles(parseInt(kSlider.value));
    updateDiamond();
});
