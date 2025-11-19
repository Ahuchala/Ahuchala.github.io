document.addEventListener("DOMContentLoaded", () => {
    // --- Toggle Between Calculators ---
    const toggleCompleteIntersection = document.getElementById("toggle-complete-intersection");
    const toggleAbelianVariety = document.getElementById("toggle-abelian-variety");
    const toggleGrassmannian = document.getElementById("toggle-grassmannian");
    const toggleFlag = document.getElementById("toggle-flag");
    const toggleTwisted = document.getElementById("toggle-twisted");

    const completeIntersectionContainer = document.getElementById("complete-intersection-container");
    const abelianVarietyContainer = document.getElementById("abelian-variety-container");
    const grassmannianContainer = document.getElementById("grassmannian-container");
    const flagContainer = document.getElementById("flag-container");
    const twistedContainer = document.getElementById("twisted-container");

    const setActiveToggle = (active, ...inactives) => {
      active.classList.add("pressed");
      inactives.forEach(el => el.classList.remove("pressed"));
    };

    const showContainer = (container) => {
      completeIntersectionContainer.style.display = "none";
      abelianVarietyContainer.style.display = "none";
      grassmannianContainer.style.display = "none";
      flagContainer.style.display = "none";
      twistedContainer.style.display = "none";
      container.style.display = "block";
      // If the container has a registered update function, call it.
      if (typeof container.updateCalculator === "function") {
          container.updateCalculator();
      }
      setTimeout(() => requestAnimationFrame(updateHodgeDiamondDescription), 10);
    };

    toggleCompleteIntersection.addEventListener("click", () => {
      showContainer(completeIntersectionContainer);
      setActiveToggle(toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian, toggleFlag,toggleTwisted);
    });
    toggleAbelianVariety.addEventListener("click", () => {
      showContainer(abelianVarietyContainer);
      setActiveToggle(toggleAbelianVariety, toggleCompleteIntersection, toggleGrassmannian, toggleFlag,toggleTwisted);
    });
    toggleGrassmannian.addEventListener("click", () => {
      showContainer(grassmannianContainer);
      setActiveToggle(toggleGrassmannian, toggleCompleteIntersection, toggleAbelianVariety, toggleFlag,toggleTwisted);
    });
    toggleFlag.addEventListener("click", () => {
      showContainer(flagContainer);
      setActiveToggle(toggleFlag, toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian,toggleTwisted);
    });
    toggleTwisted.addEventListener("click", () => {
      showContainer(twistedContainer);
      setActiveToggle(toggleTwisted, toggleFlag, toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian);
    });


    // --- Preset Button State Updates (existing code) ---
    const updateAllPressedButtons = () => {
      // Complete Intersection Presets
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
  
      // Abelian Variety Presets
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
  
    const delayedUpdate = () => setTimeout(updateAllPressedButtons, 0);
    const attachListeners = (selector, eventType) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.addEventListener(eventType, delayedUpdate);
      });
    };
  
    attachListeners("#n-slider, #k-slider, #g-slider", "input");
    attachListeners("#n-value, #k-value, #g-value", "input");
    attachListeners(".preset-button", "click");
    updateAllPressedButtons();
  
    // --- Unified Dynamic Hodge Diamond Description ---
    // Updates all elements with class "hodge-diamond-description" depending on which calculator is visible.
    function updateHodgeDiamondDescription() {
      let descriptionText = "";
      // For Complete Intersections in CP^n:
      if (completeIntersectionContainer && completeIntersectionContainer.style.display !== "none") {
        const nValueEl = document.getElementById("n-value");
        const degreeToggles = document.getElementById("degree-toggles");
        if (!nValueEl || !degreeToggles) return;
        const n = nValueEl.value;
        const degreeInputs = Array.from(degreeToggles.querySelectorAll("input.hodge-input"));
        if (degreeInputs.length === 0) {
          descriptionText = `Hodge diamond for \\(\\mathbb{CP}^${n}\\)`;
        } else if (degreeInputs.length === 1) {
          const degree = degreeInputs[0].value;
          descriptionText = `Hodge diamond for a smooth hypersurface of degree ${degree} in \\(\\mathbb{CP}^${n}\\)`;
        } else {
          const degrees = degreeInputs.map(input => input.value);
          const multidegreeStr = "(" + degrees.join(", ") + ")";
          descriptionText = `Hodge diamond for a smooth complete intersection of multidegree ${multidegreeStr} in \\(\\mathbb{CP}^${n}\\)`;
        }
      }
      // For Grassmannians:
      else if (grassmannianContainer && grassmannianContainer.style.display !== "none") {
        const nValueEl = document.getElementById("n-value-grassmannian");
        const kValueEl = document.getElementById("k-value-grassmannian");
        const rValueEl = document.getElementById("r-value-grassmannian");
        const degreeToggles = document.getElementById("degree-toggles-grassmannian");
        if (!nValueEl || !kValueEl || !rValueEl || !degreeToggles) return;
        const n = nValueEl.value;
        const k = kValueEl.value;
        const r = parseInt(rValueEl.value, 10);
        const degreeInputs = Array.from(degreeToggles.querySelectorAll("input.hodge-input"));
        if (degreeInputs.length === 0 || r === 0) {
          descriptionText = `Hodge diamond for \\(\\mathrm{Gr}(${k},${n})\\)`;
        } else if (degreeInputs.length === 1) {
          const degree = degreeInputs[0].value;
          descriptionText = `Hodge diamond for a smooth hypersurface of degree ${degree} in \\(\\mathrm{Gr}(${k},${n})\\)`;
        } else {
          const degrees = degreeInputs.map(input => input.value);
          const multidegreeStr = "(" + degrees.join(", ") + ")";
          descriptionText = `Hodge diamond for a smooth complete intersection of multidegree ${multidegreeStr} in \\(\\mathrm{Gr}(${k},${n})\\)`;
        }
      }
      // For Abelian Varieties:
      else if (abelianVarietyContainer && abelianVarietyContainer.style.display !== "none") {
        const gValueEl = document.getElementById("g-value");
        if (!gValueEl) return;
        const g = gValueEl.value;
        descriptionText = `Hodge diamond for an abelian variety of genus \\(g=${g}\\)`;
      }
      // For Flag Varieties:
      else if (flagContainer && flagContainer.style.display !== "none") {
        const dimsInput = document.getElementById("dims-input");
        const rValueFlag = document.getElementById("r-value-flag");
        const degreeToggles = document.getElementById("degree-toggles-flag");
        if (!dimsInput || !rValueFlag || !degreeToggles) return;
        const dims = dimsInput.value;
        const r = parseInt(rValueFlag.value, 10);
        const degreeInputs = Array.from(degreeToggles.querySelectorAll("input.hodge-input"));
        if (degreeInputs.length === 0) {
          descriptionText = `Hodge diamond for a partial flag of dimensions [${dims}]`;
        } else if (degreeInputs.length === 1) {
          const degree = degreeInputs[0].value;
          descriptionText = `Hodge diamond for a hypersurface of degree ${degree} in a partial flag of dimensions [${dims}]`;
        } else {
          const degrees = degreeInputs.map(input => input.value);
          const multidegreeStr = "(" + degrees.join(", ") + ")";
          descriptionText = `Hodge diamond for a complete intersection of multidegree ${multidegreeStr} in a partial flag of dimensions [${dims}]`;
        }
      }
      // For Twisted Hodge Numbers:
      else if (twistedContainer && twistedContainer.style.display !== "none") {
        const nValueEl = document.getElementById("n-value-twisted");
        const kValueEl = document.getElementById("k-value-twisted");
        const tValueEl = document.getElementById("t-value-twisted");
        if (!nValueEl || !kValueEl || !tValueEl) return;
        const n = nValueEl.value;
        const k = kValueEl.value;
        const t = parseInt(tValueEl.value, 10);
        if ( t === 0) {
          descriptionText = `Hodge diamond for \\(\\text{Gr}(${k},${n})\\)`;
        } else {
          descriptionText = `Hodge diamond for \\(\\Omega_{\\text{Gr}(${k},${n})}\\otimes\\mathcal O_{\\text{Gr}(${k},${n})}(${t})\\)`;
        }
      }
      else {
        descriptionText = "";
      }
  
      // Update all elements with class "hodge-diamond-description"
      document.querySelectorAll(".hodge-diamond-description").forEach(el => {
        el.innerHTML = descriptionText;
        if (window.MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise([el]).catch(err => console.error("MathJax typeset failed: " + err.message));
        }
      });
    }
  
    // --- Attach Event Listeners for Description Updates ---
    // For Complete Intersections:
    const nSlider = document.getElementById("n-slider");
    const nValueEl = document.getElementById("n-value");
    const kSlider = document.getElementById("k-slider");
    const kValueEl = document.getElementById("k-value");
    const degreeTogglesEl = document.getElementById("degree-toggles");
    if (nSlider) {
      nSlider.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      nSlider.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (nValueEl) nValueEl.addEventListener("input", updateHodgeDiamondDescription);
    if (kSlider) {
      kSlider.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      kSlider.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (kValueEl) kValueEl.addEventListener("input", updateHodgeDiamondDescription);
    if (degreeTogglesEl) degreeTogglesEl.addEventListener("input", updateHodgeDiamondDescription);
  
    // For Grassmannians:
    const nSliderG = document.getElementById("n-slider-grassmannian");
    const nValueG = document.getElementById("n-value-grassmannian");
    const kSliderG = document.getElementById("k-slider-grassmannian");
    const kValueG = document.getElementById("k-value-grassmannian");
    const rSliderG = document.getElementById("r-slider-grassmannian");
    const rValueG = document.getElementById("r-value-grassmannian");
    const degreeTogglesG = document.getElementById("degree-toggles-grassmannian");
    if (nSliderG) {
      nSliderG.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      nSliderG.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (nValueG) nValueG.addEventListener("input", updateHodgeDiamondDescription);
    if (kSliderG) {
      kSliderG.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      kSliderG.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (kValueG) kValueG.addEventListener("input", updateHodgeDiamondDescription);
    if (rSliderG) {
      rSliderG.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      rSliderG.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (rValueG) rValueG.addEventListener("input", updateHodgeDiamondDescription);
    if (degreeTogglesG) degreeTogglesG.addEventListener("input", updateHodgeDiamondDescription);
  
    // For Abelian Varieties:
    const gSlider = document.getElementById("g-slider");
    const gValueEl = document.getElementById("g-value");
    if (gSlider) {
      gSlider.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      gSlider.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (gValueEl) gValueEl.addEventListener("input", updateHodgeDiamondDescription);
  

    // For Twisted Hodge Numbers:
    const nSliderT = document.getElementById("n-slider-twisted");
    const nValueT = document.getElementById("n-value-twisted");
    const kSliderT = document.getElementById("k-slider-twisted");
    const kValueT = document.getElementById("k-value-twisted");
    const tSliderT = document.getElementById("t-slider-twisted");
    const tValueT = document.getElementById("t-value-twisted");
    if (nSliderT) {
      nSliderT.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      nSliderT.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (nValueT) nValueT.addEventListener("input", updateHodgeDiamondDescription);
    if (kSliderT) {
      kSliderT.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      kSliderT.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (kValueT) kValueT.addEventListener("input", updateHodgeDiamondDescription);
    if (tSliderT) {
      tSliderT.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      tSliderT.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (tValueT) tValueT.addEventListener("input", updateHodgeDiamondDescription);
  

    const presetButtons = document.querySelectorAll(".preset-button");
    presetButtons.forEach(button => {
      button.addEventListener("click", () => {
        requestAnimationFrame(updateHodgeDiamondDescription);
      });
    });
  
    // ----- Zero-color toggle  -----
    const zeroToggle = document.getElementById("zero-color-toggle");

    // All diamond roots we render into (no changes to your renderers)
    const diamondRoots = [
      document.getElementById("diamond-container"),
      document.getElementById("diamond-container-abelian"),
      document.getElementById("diamond-container-grassmannian"),
      document.getElementById("diamond-container-flag"),
      document.getElementById("diamond-container-twisted"),
    ].filter(Boolean);

    // Mark any element whose visible text is exactly "0"
    function labelZeros(root) {
      if (!root) return;
      // Be robust: scan text-bearing nodes and mark the element that shows the "0"
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const toMark = new Set();
      while (true) {
        const n = walker.nextNode();
        if (!n) break;
        const txt = n.nodeValue && n.nodeValue.trim();
        if (txt === "0") {
          const host = n.parentElement;
          if (host) toMark.add(host);
        }
      }
      toMark.forEach(el => el.classList.add("is-zero"));
    }

    // Relabel zeros in all diamonds
    function relabelAllZeros() {
      diamondRoots.forEach(labelZeros);
    }

    // Mutation observer: whenever a diamond updates, (re)label zeros if toggle is on
    const observers = diamondRoots.map(root => {
      const obs = new MutationObserver(() => {
        if (document.body.classList.contains("zero-alt-on")) labelZeros(root);
      });
      obs.observe(root, { childList: true, subtree: true });
      return obs;
    });

    // Toggle behavior: add/remove a body class; (re)label on enable
    if (zeroToggle) {
      zeroToggle.addEventListener("change", () => {
        const on = zeroToggle.checked;
        document.body.classList.toggle("zero-alt-on", on);
        if (on) relabelAllZeros();
      });
    }

    // Initial pass if someone prechecks via server-side defaults or saved state
    if (zeroToggle?.checked) {
      document.body.classList.add("zero-alt-on");
      relabelAllZeros();
    }

    updateHodgeDiamondDescription();
});
