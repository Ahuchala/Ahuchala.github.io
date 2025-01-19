document.addEventListener("DOMContentLoaded", async () => {
    const nSlider = document.getElementById("n-slider");
    const kSlider = document.getElementById("k-slider");
    const nValue = document.getElementById("n-value");
    const kValue = document.getElementById("k-value");
    const degreeToggles = document.getElementById("degree-toggles");
    const diamondContainer = document.getElementById("diamond-container");

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

        // Collect degrees from toggles
        const degrees = Array.from(degreeToggles.querySelectorAll(".degree-input"))
            .map((input) => parseInt(input.value))
            .sort((a, b) => b - a); // Ensure degrees are sorted in descending order

        diamondContainer.innerHTML = ""; // Clear previous diamond

        if (k > n) {
            // Case where k > n: Display trivial diamond (all 0s)
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

                // Add 0s for each element
                for (let i = 0; i < elements; i++) {
                    const value = document.createElement("span");
                    value.className = "diamond-value";
                    value.innerText = "0";
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

        if (k === n) {
            // Case where k == n: Display a single number (product of degrees)
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

        // Case where k < n: Fetch Hodge numbers and build the diamond
        const key = `${degrees.join("-")},${n}`;
        const hodgeNumbers = hodgeData[key] || null; // Fetch corresponding Hodge numbers from JSON

        if (!hodgeNumbers) {
            // Handle missing Hodge data
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

    // Attach slider event listeners
    nSlider.addEventListener("input", updateDiamond);
    kSlider.addEventListener("input", () => {
        const k = parseInt(kSlider.value);
        createDegreeToggles(k); // Update degree toggles dynamically
        updateDiamond(); // Refresh the diamond
    });

    // Initialize with default slider values
    createDegreeToggles(parseInt(kSlider.value));
    updateDiamond();
});
