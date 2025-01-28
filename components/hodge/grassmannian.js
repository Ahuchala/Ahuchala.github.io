import { hodgeGrassmannian } from "/components/hodge/grassmannianHodge.js";
import { hodgeCompleteIntersection } from "/components/hodge/completeIntersectionHodgeNumbers.js";

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
    const response = await fetch("/components/hodge/grassmannian_hodge_numbers_factored.json");
    const hodgeData = await response.json();

    const syncSliderAndTextbox = (slider, textbox, onChange) => {
        slider.addEventListener("input", () => {
            textbox.value = slider.value;
            onChange();
        });

        textbox.addEventListener("input", () => {
            const value = Math.max(1, Math.min(parseInt(textbox.value) || 1, 50));
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

    const evaluatePolynomial = (polynomial, degrees) => {
        const expr = math.parse(polynomial);
        const scope = {};
        degrees.forEach((deg, index) => {
            scope[`d_${index + 1}`] = deg;
        });
        return Math.abs(expr.evaluate(scope));
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

    const constructMiddleRow = (dimension, jsonData) => {
        const isOdd = dimension % 2 === 1;
        const requiredLength = isOdd ? Math.floor(dimension / 2) + 1 : dimension / 2 + 1;

        const truncatedData = jsonData.slice(0, requiredLength);
        const middleRow = [...truncatedData];

        if (isOdd) {
            for (let i = truncatedData.length - 1; i >= 0; i--) {
                middleRow.push(truncatedData[i]);
            }
        } else {
            for (let i = truncatedData.length - 2; i >= 0; i--) {
                middleRow.push(truncatedData[i]);
            }
        }

        return middleRow;
    };

    const updateDiamondGrassmannian = () => {
        const n = parseInt(nValueGrassmannian.value);
        const kInput = parseInt(kValueGrassmannian.value);
        const k = Math.min(kInput, n - kInput); // Use min(k, n-k) for symmetry
        const r = parseInt(rValueGrassmannian.value);
        const dimension = k * (n - k) - r;

        if (dimension < 0) {
            diamondContainerGrassmannian.innerHTML = `<p class="error">Error: Dimension is negative. Ensure \( r < k(n-k) \).</p>`;
            return;
        }

        const rows = 2 * dimension + 1;
        diamondContainerGrassmannian.innerHTML = "";

        const degrees = Array.from(degreeTogglesGrassmannian.querySelectorAll(".hodge-input"))
            .map((input) => parseInt(input.value))
            .sort((a, b) => b - a);

        let hodgeNumbersForDegrees;
        const key = `${k},${n},${r}`;

        if (r === 0) {
            // Special case: Use the Grassmannian's own Hodge numbers when r = 0
            hodgeNumbersForDegrees = hodgeGrassmannian(k, n);
        } else if (k === 1 || k === n - 1) {
            // Special case for Gr(1, n) or Gr(n-1, n), using P^{n-1} logic
            hodgeNumbersForDegrees = hodgeCompleteIntersection(degrees, n-1);
        } else if (key in hodgeData) {
            const hodgePolynomials = hodgeData[key];
            hodgeNumbersForDegrees = hodgePolynomials.map((poly) =>
                evaluatePolynomial(poly, degrees)
            );
        } else {
            diamondContainerGrassmannian.innerHTML = `<p class="error">Error: No data found for Gr(${k},${n}) with ${r} hypersurfaces.</p>`;
            console.error(`Key "${key}" not found in JSON data.`);
            return;
        }

        const middleRow = constructMiddleRow(dimension, hodgeNumbersForDegrees);
        const fullHodgeNumbers = hodgeGrassmannian(kInput, n);

        for (let i = 0; i < rows; i++) {
            const row = document.createElement("div");
            row.className = "diamond-row";

            const elements = i < dimension ? i + 1 : rows - i;

            for (let j = 0; j < elements; j++) {
                const valueCell = document.createElement("span");
                valueCell.className = "diamond-value";

                if (i === dimension) {
                    const grassmannianValue = fullHodgeNumbers[i]?.[j] || 0;
                    const jsonValue = middleRow[j] || 0;
                    if (r === 0) {
                        valueCell.innerText = grassmannianValue;
                    } else {
                        valueCell.innerText = grassmannianValue + jsonValue;
                    }
                } else if (i < dimension) {
                    valueCell.innerText = fullHodgeNumbers[i]?.[j] || "0";
                } else {
                    const mirrorRow = rows - i - 1;
                    valueCell.innerText = fullHodgeNumbers[mirrorRow]?.[j] || "0";
                }

                row.appendChild(valueCell);
            }

            diamondContainerGrassmannian.appendChild(row);
        }
    };

    syncSliderAndTextbox(nSliderGrassmannian, nValueGrassmannian, updateDiamondGrassmannian);
    syncSliderAndTextbox(kSliderGrassmannian, kValueGrassmannian, updateDiamondGrassmannian);
    syncSliderAndTextbox(rSliderGrassmannian, rValueGrassmannian, () => {
        updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
        updateDiamondGrassmannian();
    });

    degreeTogglesGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    nValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    kValueGrassmannian.addEventListener("input", updateDiamondGrassmannian);
    rValueGrassmannian.addEventListener("input", () => {
        updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
        updateDiamondGrassmannian();
    });

    updateDegreeTogglesGrassmannian(parseInt(rValueGrassmannian.value));
    updateDiamondGrassmannian();
});
