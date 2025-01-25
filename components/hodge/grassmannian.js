import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";

document.addEventListener("DOMContentLoaded", async () => {
    const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
    const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
    const rSliderGrassmannian = document.getElementById("r-slider-grassmannian");
    const nValueGrassmannian = document.getElementById("n-value-grassmannian");
    const kValueGrassmannian = document.getElementById("k-value-grassmannian");
    const rValueGrassmannian = document.getElementById("r-value-grassmannian");
    const degreeTogglesGrassmannian = document.getElementById("degree-toggles-grassmannian");
    const diamondContainerGrassmannian = document.getElementById("diamond-container-grassmannian");

    // Load JSON data
    const response = await fetch("/components/hodge/grassmannian_CI_hodge_numbers.json"); // Replace with the actual path to your JSON file
    const hodgeData = await response.json();

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

    // Extend the middle row using Hodge symmetry and only relevant JSON data
const constructMiddleRow = (dimension, jsonData) => {
    const isOdd = dimension % 2 === 1; // Check if the dimension is odd
    const requiredLength = isOdd ? Math.floor(dimension / 2) + 1 : dimension / 2 + 1;

    // Use only the relevant portion of the JSON data
    const truncatedData = jsonData.slice(0, requiredLength);

    // Construct the full middle row using Hodge symmetry
    const middleRow = [...truncatedData];

    if (isOdd) {
        // Odd: Mirror and repeat the middle element
        for (let i = truncatedData.length - 1; i >= 0; i--) {
            middleRow.push(truncatedData[i]);
        }
    } else {
        // Even: Mirror without repeating the middle element
        for (let i = truncatedData.length - 2; i >= 0; i--) {
            middleRow.push(truncatedData[i]);
        }
    }

    return middleRow;
};

const updateDiamondGrassmannian = () => {
    const n = parseInt(nValueGrassmannian.value);
    const kInput = parseInt(kValueGrassmannian.value);
    const k = Math.min(kInput, n - kInput); // Replace k with min(k, n-k)
    const r = parseInt(rValueGrassmannian.value);
    const dimension = k * (n - k) - r;

    if (dimension < 0) {
        diamondContainerGrassmannian.innerHTML = `<p class="error">Error: Dimension is negative. Ensure \( r < k(n-k) \).</p>`;
        return;
    }

    const rows = 2 * dimension + 1; // Correct number of rows

    diamondContainerGrassmannian.innerHTML = "";

    // Collect and sort degrees in weakly decreasing order
    const degrees = Array.from(degreeTogglesGrassmannian.querySelectorAll(".hodge-input"))
        .map((input) => parseInt(input.value))
        .sort((a, b) => b - a); // Sort degrees in weakly decreasing order

    // Construct the key with proper formatting
    const degreeString = degrees.join(", ");
    const key = `${k},${n},{${degreeString}}`; // Ensure this matches the JSON format exactly

    // Look up Hodge numbers in the JSON file
    const hodgeNumbersFromJson = hodgeData[key]
        ? hodgeData[key].replace(/[{}]/g, "").split(",").map(Number)
        : null;

    if (!hodgeNumbersFromJson) {
        diamondContainerGrassmannian.innerHTML = `<p class="error">Error: No Hodge numbers found for this configuration.</p>`;
        console.error(`Key "${key}" not found in JSON data.`);
        return;
    }

    // Construct the middle row using the updated logic
    const middleRow = constructMiddleRow(dimension, hodgeNumbersFromJson);

    // Get the full Hodge diamond for Gr(k, n)
    const fullHodgeNumbers = hodgeGrassmannian(kInput, n);

    for (let i = 0; i < rows; i++) {
        const row = document.createElement("div");
        row.className = "diamond-row";

        const elements = i < dimension ? i + 1 : rows - i;

        for (let j = 0; j < elements; j++) {
            const valueCell = document.createElement("span");
            valueCell.className = "diamond-value";

            if (i === dimension) {
                // Middle row: add Hodge numbers from JSON to grassmannianHodge.js
                const grassmannianValue = fullHodgeNumbers[i]?.[j] || 0;
                const jsonValue = middleRow[j] || 0;
                valueCell.innerText = grassmannianValue + jsonValue;
            } else if (i < dimension) {
                // First half: use values from hodgeGrassmannian
                valueCell.innerText = fullHodgeNumbers[i]?.[j] || "0";
            } else {
                // Second half: mirror values using Serre duality
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
    
    // Add event listeners to degree toggles
    degreeTogglesGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    
    // Ensure updates when textboxes are changed
    nValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    kValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    rValueGrassmannian.addEventListener("input", () => {
        updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
        updateDiamondGrassmannian();
    });
    
    updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value)); // Initialize degree toggles
    updateDiamondGrassmannian(); // Initialize Hodge diamond
    
    
});
