// import { setupCompleteIntersection } from "/components/hodge/completeIntersection.js";
// import { setupAbelianVariety } from "/components/hodge/abelianVariety.js";

document.addEventListener("DOMContentLoaded", () => {
    const toggleCompleteIntersection = document.getElementById("toggle-complete-intersection");
    const toggleAbelianVariety = document.getElementById("toggle-abelian-variety");
    const completeIntersectionContainer = document.getElementById("complete-intersection-container");
    const abelianVarietyContainer = document.getElementById("abelian-variety-container");

    toggleCompleteIntersection.addEventListener("click", () => {
        completeIntersectionContainer.style.display = "block";
        abelianVarietyContainer.style.display = "none";
    });

    toggleAbelianVariety.addEventListener("click", () => {
        completeIntersectionContainer.style.display = "none";
        abelianVarietyContainer.style.display = "block";
    });

    // Initialize calculators
    // setupCompleteIntersection();
    // setupAbelianVariety();
});
