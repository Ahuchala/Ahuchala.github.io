document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("compute-btn").addEventListener("click", async () => {
        const nInput = parseInt(document.getElementById("n-input").value);
        const degreesInput = document
            .getElementById("degrees-input")
            .value.split(",")
            .map((d) => parseInt(d.trim()))
            .sort((a, b) => b - a); // Ensure degrees are sorted in descending order
    
        if (isNaN(nInput) || degreesInput.some(isNaN)) {
            document.getElementById("output").innerText =
                "Invalid input. Please enter valid numbers.";
            return;
        }
    
        const k = degreesInput.length; // Number of hypersurfaces
        const diamondSize = nInput - k + 1;
    
        const key = degreesInput.join("-") + `,${nInput}`;
    
        // Fetch the JSON file
        const response = await fetch("hodge_numbers.json");
        const hodgeData = await response.json();
    
        const result = hodgeData[key];
    
        const diamondContainer = document.getElementById("diamond-container");
        diamondContainer.innerHTML = ""; // Clear previous diamond
    
        if (result) {
            // Build the Hodge diamond
            for (let p = 0; p < diamondSize; p++) {
                const row = document.createElement("div");
                row.className = "diamond-row";
    
                // Add spaces for alignment
                for (let s = 0; s < Math.abs(diamondSize - 1 - p); s++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }
    
                // Add values
                for (let q = 0; q < diamondSize; q++) {
                    const value = document.createElement("span");
                    value.className = "diamond-value";
    
                    if (p + q === diamondSize - 1) {
                        value.innerText = result[q] || 0; // JSON-provided values in the middle
                    } else if (p === q || p + q === diamondSize - 1) {
                        value.innerText = 1; // 1s along diagonals
                    } else {
                        value.innerText = 0; // Other values are 0
                    }
    
                    row.appendChild(value);
                }
    
                diamondContainer.appendChild(row);
            }
    
            document.getElementById("output").innerText = `Hodge diamond generated for n=${nInput}, degrees=${degreesInput.join(",")}`;
        } else {
            document.getElementById("output").innerText = "No data available for the given input.";
            diamondContainer.innerHTML = '<p class="placeholder">No valid Hodge diamond could be computed.</p>';
        }
    });
    
});
