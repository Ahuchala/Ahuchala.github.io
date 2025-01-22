// import { setupCompleteIntersection } from "/components/hodge/completeIntersection.js";
// import { setupAbelianVariety } from "/components/hodge/abelianVariety.js";

document.addEventListener("DOMContentLoaded", () => {
    const nSliderGrassmannian = document.getElementById("n-slider-grassmannian");
    const kSliderGrassmannian = document.getElementById("k-slider-grassmannian");
    const nValueGrassmannian = document.getElementById("n-value-grassmannian");
    const kValueGrassmannian = document.getElementById("k-value-grassmannian");
    const diamondContainerGrassmannian = document.getElementById("diamond-container-grassmannian");

    const toggleCompleteIntersection = document.getElementById("toggle-complete-intersection");
    const toggleAbelianVariety = document.getElementById("toggle-abelian-variety");
    const toggleGrassmannian = document.getElementById("toggle-grassmannian");

    const completeIntersectionContainer = document.getElementById("complete-intersection-container");
    const abelianVarietyContainer = document.getElementById("abelian-variety-container");
    const grassmannianContainer = document.getElementById("grassmannian-container");

    // Highlight the active toggle button
    const setActiveToggle = (activeToggle, ...inactiveToggles) => {
        activeToggle.classList.add("pressed");
        inactiveToggles.forEach(toggle => toggle.classList.remove("pressed"));
    };
    
    toggleCompleteIntersection.addEventListener("click", () => {
        completeIntersectionContainer.style.display = "block";
        abelianVarietyContainer.style.display = "none";
        grassmannianContainer.style.display = "none";
        setActiveToggle(toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian);
    });
    
    toggleAbelianVariety.addEventListener("click", () => {
        completeIntersectionContainer.style.display = "none";
        abelianVarietyContainer.style.display = "block";
        grassmannianContainer.style.display = "none";
        setActiveToggle(toggleAbelianVariety, toggleCompleteIntersection, toggleGrassmannian);
    });
    
    toggleGrassmannian.addEventListener("click", () => {
        completeIntersectionContainer.style.display = "none";
        abelianVarietyContainer.style.display = "none";
        grassmannianContainer.style.display = "block";
        setActiveToggle(toggleGrassmannian, toggleCompleteIntersection, toggleAbelianVariety);
    });
    

    const showContainer = (container) => {
        completeIntersectionContainer.style.display = "none";
        abelianVarietyContainer.style.display = "none";
        grassmannianContainer.style.display = "none";

        container.style.display = "block";
    };

    // Toggle Button Functionality
    toggleCompleteIntersection.addEventListener("click", () => showContainer(completeIntersectionContainer));
    toggleAbelianVariety.addEventListener("click", () => showContainer(abelianVarietyContainer));
    toggleGrassmannian.addEventListener("click", () => showContainer(grassmannianContainer));

    // Initialize calculators
    // setupCompleteIntersection();
    // setupAbelianVariety();
});
document.addEventListener("DOMContentLoaded", () => {
    const updateAllPressedButtons = () => {
        // Update Complete Intersection Presets
        const completeIntersectionButtons = document.querySelectorAll("#complete-intersection-container .preset-button");
        const nValue = parseInt(document.getElementById("n-value")?.value || 0);
        const kValue = parseInt(document.getElementById("k-value")?.value || 0);
        const degreeToggles = document.getElementById("degree-toggles");

        completeIntersectionButtons.forEach((button) => {
            const n = parseInt(button.dataset.n);
            const k = parseInt(button.dataset.k);
            const degrees = button.dataset.degrees?.split(",").map(Number);

            const isActive =
                n === nValue &&
                k === kValue &&
                degrees?.every((deg, i) => deg === parseInt(degreeToggles.children[i]?.querySelector("input")?.value || 0));

            if (isActive) {
                button.classList.add("pressed");
            } else {
                button.classList.remove("pressed");
            }
        });

        // Update Abelian Variety Presets
        const abelianVarietyButtons = document.querySelectorAll("#abelian-variety-container .preset-button");
        const gValue = parseInt(document.getElementById("g-value")?.value || 0);

        abelianVarietyButtons.forEach((button) => {
            const g = parseInt(button.dataset.g);

            if (g === gValue) {
                button.classList.add("pressed");
            } else {
                button.classList.remove("pressed");
            }
        });
    };

    // Wrap the function call in a small delay to ensure state is updated
    const delayedUpdate = () => setTimeout(updateAllPressedButtons, 0);

    // Attach Listeners
    const attachListeners = (selector, eventType) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.addEventListener(eventType, delayedUpdate);
        });
    };

    // Attach to sliders, textboxes, and buttons
    attachListeners("#n-slider, #k-slider, #g-slider", "input");
    attachListeners("#n-value, #k-value, #g-value", "input");
    attachListeners(".preset-button", "click");

    // Initial call to update button states
    updateAllPressedButtons();
});

