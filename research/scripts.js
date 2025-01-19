document.addEventListener("DOMContentLoaded", async () => {
    const nSlider = document.getElementById("n-slider");
    const kSlider = document.getElementById("k-slider");
    const nValue = document.getElementById("n-value");
    const kValue = document.getElementById("k-value");
    const degreeToggles = document.getElementById("degree-toggles");
    const diamondContainer = document.getElementById("diamond-container");

    let lastUserSetK = parseInt(kSlider.value); // Track the last user-set value of k

    // Load Hodge numbers JSON
    let hodgeData = {};
    try {
        const response = await fetch("hodge_numbers.json");
        hodgeData = await response.json();
    } catch (error) {
        console.error("Error loading Hodge numbers:", error);
        return;
    }

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

            // Add event listener to update the diamond when degree changes
            input.addEventListener("input", updateDiamond);

            toggleContainer.appendChild(label);
            toggleContainer.appendChild(input);
            degreeToggles.appendChild(toggleContainer);
        }
    };

    const updateDiamond = () => {
        const n = parseInt(nSlider.value);
        const k = parseInt(kSlider.value);
        const rows = 2 * (n - k) + 1;
        const targetRowIndex = n - k; // Target row is (n-k+1)th, zero-indexed

        // Update slider values
        nValue.innerText = n;
        kValue.innerText = k;

        diamondContainer.innerHTML = ""; // Clear previous diamond

        if (k === n) {
            // Case where k == n: Display a single number (product of degrees)
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

        if (k === 0) {
            // Case where k = 0: Draw a normal Hodge diamond
            for (let j = 0; j < rows; j++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
                const spaces = (rows - elements) / 2;

                // Add spaces for alignment (left)
                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                // Add values for each element in the row
                for (let i = 0; i < elements; i++) {
                    const value = document.createElement("span");
                    value.className = "diamond-value";
                    // Apply the delta(i, j) rule
                    value.innerText = 2 * i === Math.min(j, 2 * (n - k) - j) ? "1" : "0";
                    row.appendChild(value);
                }

                // Add spaces for alignment (right)
                for (let s = 0; s < spaces; s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                diamondContainer.appendChild(row);
            }
            return;
        }

        // Case where 0 < k < n: Fetch Hodge numbers and build the diamond
        const degrees = Array.from(degreeToggles.querySelectorAll(".degree-input"))
            .map((input) => parseInt(input.value))
            .sort((a, b) => b - a); // Ensure degrees are sorted in descending order

        const key = `${degrees.join("-")},${n}`;
        const hodgeNumbers = hodgeData[key] || null; // Fetch corresponding Hodge numbers from JSON

        if (!hodgeNumbers) {
            // Handle missing Hodge data gracefully
            diamondContainer.innerHTML = '<p class="placeholder">No data available for the given input.</p>';
            return;
        }

        for (let j = 0; j < rows; j++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const elements = j <= (rows - 1) / 2 ? j + 1 : rows - j;
            const spaces = (rows - elements) / 2;

            // Add spaces for alignment (left)
            for (let s = 0; s < spaces; s++) {
                const space = document.createElement("span");
                space.className = "diamond-space";
                row.appendChild(space);
            }

            // Add values for each element in the row
            for (let i = 0; i < elements; i++) {
                const value = document.createElement("span");
                value.className = "diamond-value";

                if (j === targetRowIndex) {
                    // Target row: Use Hodge numbers for symmetry
                    const symmetricIndex = targetRowIndex - i; // Symmetric position index
                    value.innerText = hodgeNumbers[i] || hodgeNumbers[symmetricIndex] || 0;
                } else {
                    // All other rows: Use delta rule with the updated condition
                    const condition = 2 * i === Math.min(j, 2 * (n - k) - j);
                    value.innerText = condition ? "1" : "0";
                }

                row.appendChild(value);
            }

            // Add spaces for alignment (right)
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

        // Update degree toggles dynamically
        createDegreeToggles(parseInt(kSlider.value));
        updateDiamond(); // Refresh the diamond
    };

    // Attach slider event listeners
    nSlider.addEventListener("input", () => {
        updateKSlider(); // Update k-slider when n changes
    });

    kSlider.addEventListener("input", () => {
        lastUserSetK = parseInt(kSlider.value); // Update the last user-set value
        createDegreeToggles(lastUserSetK); // Update degree toggles dynamically
        updateDiamond(); // Refresh the diamond
    });

    // Initialize with default slider values
    createDegreeToggles(parseInt(kSlider.value));
    updateDiamond();
});
