// hodge/scripts.js
//
// Cross-cutting init logic shared by all 6 Hodge calculators. Called once from
// pages/hodge.js after every individual calculator's init() has run.
//
// Responsibilities:
//   1. Calculator toggle buttons — show/hide container divs, mark active button
//   2. Label alignment — equalize .input-row label widths within each container
//   3. Preset button highlighting — keep preset buttons highlighted when active
//   4. Dynamic diamond description — update the "Hodge diamond for a smooth ..."
//      caption above each diamond in real time as inputs change
//   5. Coordinate annotation — stamp data-i / data-j attributes and tooltip titles
//      onto every diamond cell (used by the Twisted calculator's click handler)
//   6. Zero-entry coloring — add .is-zero class to cells whose value is "0"
//      when the "Alternate color for zero entries" toggle is on
//   7. Hide-top-half toggle — add .is-top-half to rows above the middle row
//   8. Scroll wheel guard — prevent number inputs from changing on wheel scroll

export function init() {
    // --- Toggle Between Calculators ---
    const toggleCompleteIntersection = document.getElementById("toggle-complete-intersection");
    const toggleAbelianVariety = document.getElementById("toggle-abelian-variety");
    const toggleGrassmannian = document.getElementById("toggle-grassmannian");
    const toggleFlag = document.getElementById("toggle-flag");
    const toggleTwisted = document.getElementById("toggle-twisted");
    const toggleProductGrassmannian = document.getElementById("toggle-product-grassmannian");

    const completeIntersectionContainer = document.getElementById("complete-intersection-container");
    const abelianVarietyContainer = document.getElementById("abelian-variety-container");
    const grassmannianContainer = document.getElementById("grassmannian-container");
    const flagContainer = document.getElementById("flag-container");
    const twistedContainer = document.getElementById("twisted-container");
    const productGrassmannianContainer = document.getElementById("product-grassmannian-container");

    const setActiveToggle = (active, ...inactives) => {
      active.classList.add("pressed");
      inactives.forEach(el => el.classList.remove("pressed"));
    };

    // Aligns all .input-row labels within a container to the same width so
    // sliders line up. Must be called while the container is visible.
    function alignLabelsInContainer(container) {
      if (!container) return;
      const labels = Array.from(container.querySelectorAll(".input-row label"));
      labels.forEach(l => { l.style.minWidth = ""; });
      const maxW = labels.reduce((m, l) => Math.max(m, l.scrollWidth), 0);
      labels.forEach(l => { l.style.minWidth = maxW + "px"; });
    }

    const showContainer = (container) => {
      completeIntersectionContainer.style.display = "none";
      abelianVarietyContainer.style.display = "none";
      grassmannianContainer.style.display = "none";
      flagContainer.style.display = "none";
      twistedContainer.style.display = "none";
      if (productGrassmannianContainer) productGrassmannianContainer.style.display = "none";
      container.style.display = "block";
      // Align labels now that the container is visible (scrollWidth is valid).
      requestAnimationFrame(() => alignLabelsInContainer(container));
      // If the container has a registered update function, call it.
      if (typeof container.updateCalculator === "function") {
          container.updateCalculator();
      }
      requestAnimationFrame(updateHodgeDiamondDescription);
    };

    toggleCompleteIntersection.addEventListener("click", () => {
      showContainer(completeIntersectionContainer);
      setActiveToggle(toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian, toggleFlag, toggleTwisted, toggleProductGrassmannian);
    });
    toggleAbelianVariety.addEventListener("click", () => {
      showContainer(abelianVarietyContainer);
      setActiveToggle(toggleAbelianVariety, toggleCompleteIntersection, toggleGrassmannian, toggleFlag, toggleTwisted, toggleProductGrassmannian);
    });
    toggleGrassmannian.addEventListener("click", () => {
      showContainer(grassmannianContainer);
      setActiveToggle(toggleGrassmannian, toggleCompleteIntersection, toggleAbelianVariety, toggleFlag, toggleTwisted, toggleProductGrassmannian);
    });
    toggleFlag.addEventListener("click", () => {
      showContainer(flagContainer);
      setActiveToggle(toggleFlag, toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian, toggleTwisted, toggleProductGrassmannian);
    });
    toggleTwisted.addEventListener("click", () => {
      showContainer(twistedContainer);
      setActiveToggle(toggleTwisted, toggleFlag, toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian, toggleProductGrassmannian);
    });
    if (toggleProductGrassmannian) {
      toggleProductGrassmannian.addEventListener("click", () => {
        showContainer(productGrassmannianContainer);
        setActiveToggle(toggleProductGrassmannian, toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian, toggleFlag, toggleTwisted);
      });
    }

    // Show more / show less toggle for advanced calculators
    const toggleMenu = document.getElementById("toggle-menu");
    const toggleAdvancedBtn = document.getElementById("toggle-advanced");
    const advancedContainers = [abelianVarietyContainer, flagContainer, productGrassmannianContainer];
    const advancedToggles = [toggleAbelianVariety, toggleFlag, toggleProductGrassmannian];
    if (toggleAdvancedBtn && toggleMenu) {
      toggleAdvancedBtn.addEventListener("click", () => {
        const expanding = !toggleMenu.classList.contains("show-advanced");
        toggleMenu.classList.toggle("show-advanced", expanding);
        toggleAdvancedBtn.setAttribute("aria-expanded", expanding);
        toggleAdvancedBtn.textContent = expanding ? "▲ Show less" : "▼ Show more";
        // If collapsing while an advanced calculator is visible, revert to CI
        if (!expanding) {
          const advancedVisible = advancedContainers.some(c => c && c.style.display !== "none");
          if (advancedVisible) {
            showContainer(completeIntersectionContainer);
            setActiveToggle(toggleCompleteIntersection, ...advancedToggles, toggleGrassmannian, toggleTwisted);
          }
        }
      });
    }

    // Align the default-visible container on first paint.
    requestAnimationFrame(() => alignLabelsInContainer(completeIntersectionContainer));

    // --- Preset Button State Updates ---
    const getDegrees = (container) =>
      [...(container?.children || [])].map(row => parseInt(row.querySelector("input")?.value || 0, 10));

    const updateAllPressedButtons = () => {
      // Complete Intersection (P^n)
      const nValue = parseInt(document.getElementById("n-value")?.value || 0, 10);
      const degreeToggles = document.getElementById("degree-toggles");
      const ciDegrees = getDegrees(degreeToggles);
      document.querySelectorAll("#complete-intersection-container .preset-button").forEach(btn => {
        const n = parseInt(btn.dataset.n, 10);
        const degrees = btn.dataset.degrees?.split(",").map(Number) ?? [];
        const match = n === nValue && degrees.length === ciDegrees.length &&
          degrees.every((d, i) => d === ciDegrees[i]);
        btn.classList.toggle("pressed", match);
      });

      // Abelian Variety
      const gValue = parseInt(document.getElementById("g-value")?.value || 0, 10);
      document.querySelectorAll("#abelian-variety-container .preset-button").forEach(btn => {
        btn.classList.toggle("pressed", parseInt(btn.dataset.g, 10) === gValue);
      });

      // Grassmannian
      const grN = parseInt(document.getElementById("n-value-grassmannian")?.value || 0, 10);
      const grK = parseInt(document.getElementById("k-value-grassmannian")?.value || 0, 10);
      const grR = parseInt(document.getElementById("r-value-grassmannian")?.value || 0, 10);
      const grDegToggles = document.getElementById("degree-toggles-grassmannian");
      const grDegrees = getDegrees(grDegToggles);
      document.querySelectorAll("#grassmannian-container .preset-button").forEach(btn => {
        const n = parseInt(btn.dataset.n, 10);
        const k = parseInt(btn.dataset.k, 10);
        const r = parseInt(btn.dataset.r, 10);
        const degrees = btn.dataset.degrees?.split(",").map(Number) ?? [];
        const match = n === grN && k === grK && r === grR &&
          degrees.length === grDegrees.length && degrees.every((d, i) => d === grDegrees[i]);
        btn.classList.toggle("pressed", match);
      });

      // Product Grassmannian
      const prodR = parseInt(document.getElementById("r-value-product")?.value || 0, 10);
      const prodDegToggles = document.getElementById("degree-toggles-product");
      const prodDegrees = getDegrees(prodDegToggles);
      const factorRows = [...(document.getElementById("factor-inputs-product")?.children || [])];
      const currentFactors = factorRows.flatMap(row => [
        parseInt(row.querySelector(".factor-k-value")?.value || 0, 10),
        parseInt(row.querySelector(".factor-n-value")?.value || 0, 10),
      ]);
      document.querySelectorAll("#product-grassmannian-container .preset-button[data-factors]").forEach(btn => {
        const btnFactors = btn.dataset.factors?.split(",").map(Number) ?? [];
        const btnR = parseInt(btn.dataset.r, 10);
        const btnDegrees = btn.dataset.degrees ? btn.dataset.degrees.split(",").map(Number) : [];
        const match = btnR === prodR &&
          btnFactors.length === currentFactors.length &&
          btnFactors.every((f, i) => f === currentFactors[i]) &&
          btnDegrees.length === prodDegrees.length &&
          btnDegrees.every((d, i) => d === prodDegrees[i]);
        btn.classList.toggle("pressed", match);
      });
    };

    const delayedUpdate = () => setTimeout(updateAllPressedButtons, 0);
    const attachListeners = (selector, eventType) => {
      document.querySelectorAll(selector).forEach(el => el.addEventListener(eventType, delayedUpdate));
    };

    attachListeners("#n-slider, #k-slider, #g-slider", "input");
    attachListeners("#n-value, #k-value, #g-value", "input");
    attachListeners(".preset-button", "click");
    document.getElementById("degree-toggles")?.addEventListener("input", delayedUpdate);
    attachListeners("#n-value-grassmannian, #k-value-grassmannian, #r-value-grassmannian, #n-slider-grassmannian, #k-slider-grassmannian, #r-slider-grassmannian", "input");
    document.getElementById("degree-toggles-grassmannian")?.addEventListener("input", delayedUpdate);
    document.getElementById("factor-inputs-product")?.addEventListener("input", delayedUpdate);
    document.getElementById("r-value-product")?.addEventListener("input", delayedUpdate);
    document.getElementById("r-slider-product")?.addEventListener("input", delayedUpdate);
    document.getElementById("degree-toggles-product")?.addEventListener("input", delayedUpdate);

    updateAllPressedButtons();
  
    // --- Unified Dynamic Hodge Diamond Description ---

    // Returns "\mathbb{P}^{n-1}" when Gr(k,n) is projective space (k=1 or k=n-1),
    // otherwise returns "\mathrm{Gr}(k,n)".
    function grOrPn(k, n) {
      const ki = parseInt(k, 10), ni = parseInt(n, 10);
      if (ki === 1 || ki === ni - 1) return `\\mathbb{P}^{${ni - 1}}`;
      return `\\mathrm{Gr}(${k},${n})`;
    }

    function updateHodgeDiamondDescription() {
      let descriptionText = "";

      // ----- Complete intersections in CP^n -----
      if (completeIntersectionContainer && completeIntersectionContainer.style.display !== "none") {
        const nValueEl = document.getElementById("n-value");
        const degreeToggles = document.getElementById("degree-toggles");
        if (!nValueEl || !degreeToggles) return;

        const nRaw = nValueEl.value.trim();
        const degreeInputs = Array.from(degreeToggles.querySelectorAll("input.hodge-input"));

        if (nRaw === "" || isNaN(parseInt(nRaw, 10))) {
          descriptionText = "Hodge diamond for a complete intersection in projective space";
        } else {
          const n = parseInt(nRaw, 10);
          const degreesRaw = degreeInputs.map(inp => (inp.value ?? "").trim());
          const anyBadDegree = degreesRaw.some(d => d === "" || isNaN(parseInt(d, 10)));

          if (degreeInputs.length === 0 || anyBadDegree) {
            descriptionText = `Hodge diamond for a smooth complete intersection in \\(\\mathbb{P}^{${n}}\\)`;
          } else if (degreeInputs.length === 1) {
            const degree = parseInt(degreesRaw[0], 10);
            descriptionText =
              `Hodge diamond for a smooth hypersurface of degree ${degree} in ` +
              `\\(\\mathbb{P}^{${n}}\\)`;
          } else {
            const degrees = degreesRaw.map(d => parseInt(d, 10));
            const multidegreeStr = "(" + degrees.join(", ") + ")";
            descriptionText =
              `Hodge diamond for a smooth complete intersection of multidegree ${multidegreeStr} ` +
              `in \\(\\mathbb{P}^{${n}}\\)`;
          }
          const sElCI = document.getElementById("s-value");
          const sCI = sElCI ? (parseInt(sElCI.value, 10) || 0) : 0;
          if (sCI > 0) {
            descriptionText += `, blown up at \\(${sCI}\\) point${sCI === 1 ? "" : "s"} in general position`;
          }
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
        const ambientGr = grOrPn(k, n);
        if (degreeInputs.length === 0 || r === 0) {
          descriptionText = `Hodge diamond for \\(${ambientGr}\\)`;
        } else if (degreeInputs.length === 1) {
          const degree = degreeInputs[0].value;
          descriptionText = `Hodge diamond for a smooth hypersurface of degree ${degree} in \\(${ambientGr}\\)`;
        } else {
          const degrees = degreeInputs.map(input => input.value);
          const multidegreeStr = "(" + degrees.join(", ") + ")";
          descriptionText = `Hodge diamond for a smooth complete intersection of multidegree ${multidegreeStr} in \\(${ambientGr}\\)`;
        }
        const sElGr = document.getElementById("s-value-grassmannian");
        const sGr = sElGr ? (parseInt(sElGr.value, 10) || 0) : 0;
        if (sGr > 0) {
          descriptionText += `, blown up at \\(${sGr}\\) point${sGr === 1 ? "" : "s"} in general position`;
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

        const dimsList = dimsInput.value
          .split(",")
          .map(s => s.trim())
          .filter(s => s !== "");
        const dimsStr = dimsList.join(", ");

        const r = parseInt(rValueFlag.value, 10);
        const degreeInputs = Array.from(
          degreeToggles.querySelectorAll("input.hodge-input")
        );

        if (!Number.isFinite(r) || r === 0 || degreeInputs.length === 0) {
          descriptionText = `Hodge diamond for a partial flag of dimensions [${dimsStr}]`;
        } else if (degreeInputs.length === 1) {
          const block = (degreeInputs[0].value || "").trim();
          descriptionText =
            `Hodge diamond for a hypersurface of multidegree [${block}] ` +
            `in a partial flag of dimensions [${dimsStr}]`;
        } else {
          const blocks = degreeInputs.map(inp => {
            const txt = (inp.value || "").trim();
            return `[${txt}]`;
          });
          descriptionText =
            `Hodge diamond for a complete intersection (r=${r}) ` +
            `in a partial flag of dimensions [${dimsStr}] ` +
            `with multidegrees ${blocks.join(", ")}`;
        }
      }

      // For Product of Grassmannians:
      else if (productGrassmannianContainer && productGrassmannianContainer.style.display !== "none") {
        const r = parseInt(document.getElementById("r-value-product")?.value, 10);
        const factorRows = Array.from(
          document.querySelectorAll("#factor-inputs-product .factor-row-product")
        );
        const factorStrs = factorRows.map(row => {
          const k = row.querySelector(".factor-k-value")?.value;
          const n = row.querySelector(".factor-n-value")?.value;
          return grOrPn(k, n);
        });
        const productStr = factorStrs.join("\\times ");
        const degInputs = Array.from(
          document.getElementById("degree-toggles-product")
            ?.querySelectorAll(".degree-toggle") ?? []
        );
        if (!r || degInputs.length === 0) {
          descriptionText = `Hodge diamond for \\(${productStr}\\)`;
        } else {
          const degs = degInputs.map(row => {
            const vals = Array.from(row.querySelectorAll(".hodge-input")).map(i => i.value ?? "?");
            return `(${vals.join(",")})`;
          });
          descriptionText =
            `Hodge diamond for a smooth complete intersection of multidegree ${degs.join(", ")} ` +
            `in \\(${productStr}\\)`;
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
        if (t === 0) {
          descriptionText = `Hodge diamond for \\(\\text{Gr}(${k},${n})\\)`;
        } else {
          descriptionText = `Hodge diamond for \\(\\Omega_{\\text{Gr}(${k},${n})}\\otimes\\mathcal O_{\\text{Gr}(${k},${n})}(${t})\\)`;
        }
      }
      else {
        descriptionText = "";
      }
  
      document.querySelectorAll(".hodge-diamond-description").forEach(el => {
        el.innerHTML = descriptionText;
        if (window.MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise([el]).catch(err => console.error("MathJax typeset failed: " + err.message));
        }
      });
    }
  
    // --- Attach Event Listeners for Description Updates ---
    // (unchanged listeners omitted for brevity – keep your existing ones)
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

    const sSliderCI = document.getElementById("s-slider");
    const sValueCI = document.getElementById("s-value");
    if (sSliderCI) {
      sSliderCI.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      sSliderCI.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (sValueCI) sValueCI.addEventListener("input", updateHodgeDiamondDescription);

    const sSliderGr = document.getElementById("s-slider-grassmannian");
    const sValueGr = document.getElementById("s-value-grassmannian");
    if (sSliderGr) {
      sSliderGr.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      sSliderGr.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (sValueGr) sValueGr.addEventListener("input", updateHodgeDiamondDescription);

    const gSlider = document.getElementById("g-slider");
    const gValueEl = document.getElementById("g-value");
    if (gSlider) {
      gSlider.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
      gSlider.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (gValueEl) gValueEl.addEventListener("input", updateHodgeDiamondDescription);
  

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

    // Product Grassmannian inputs — r slider/textbox
    const rSliderProduct = document.getElementById("r-slider-product");
    const rValueProduct  = document.getElementById("r-value-product");
    if (rSliderProduct) {
      rSliderProduct.addEventListener("input",  () => requestAnimationFrame(updateHodgeDiamondDescription));
      rSliderProduct.addEventListener("change", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    if (rValueProduct) rValueProduct.addEventListener("input", updateHodgeDiamondDescription);
    // Factor rows and degree toggles are dynamically created; use event delegation
    const factorInputsProduct = document.getElementById("factor-inputs-product");
    if (factorInputsProduct) {
      factorInputsProduct.addEventListener("input", () => requestAnimationFrame(updateHodgeDiamondDescription));
    }
    const degTogglesProduct = document.getElementById("degree-toggles-product");
    if (degTogglesProduct) degTogglesProduct.addEventListener("input", updateHodgeDiamondDescription);
    // Re-describe after Add/Remove Factor buttons
    ["add-factor-product","remove-factor-product"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => requestAnimationFrame(updateHodgeDiamondDescription));
    });

    const presetButtons = document.querySelectorAll(".preset-button");
    presetButtons.forEach(button => {
      button.addEventListener("click", () => {
        requestAnimationFrame(updateHodgeDiamondDescription);
      });
    });
  
    // ----- Zero-color toggle  -----
    const zeroToggle = document.getElementById("zero-color-toggle");

    // All diamond roots we render into
    const diamondRoots = [
      document.getElementById("diamond-container"),
      document.getElementById("diamond-container-abelian"),
      document.getElementById("diamond-container-grassmannian"),
      document.getElementById("diamond-container-flag"),
      document.getElementById("diamond-container-twisted"),
      document.getElementById("diamond-container-product"),
    ].filter(Boolean);

    // Stamp data-i, data-j, and a hover tooltip onto every cell of the given diamond root.
    //
    // Diamond convention: the diamond has 2N+1 rows. Row 0 (top) is h^{N,N}; row 2N
    // (bottom) is h^{0,0}. In each row, the leftmost cell has the largest i value.
    //
    // For a row at DOM index idxTop (0 = top of diamond):
    //   - "antidiagonal index" r = i + j = (2N) - idxTop  (bottom row → r=0, top row → r=2N)
    //   - i ranges from iMax = min(r, N) down to iMin = max(0, r-N), left to right
    //   - j = r - i
    //
    // These coordinates are consumed by the Twisted calculator's click handler to show
    // which Schubert partitions contribute to the clicked h^{i,j} value.
    function annotateDiamondCoords(root) {
      if (!root) return;

      const rows = Array.from(
        root.querySelectorAll(".hodge-row, .diamond-row")
      );
      if (!rows.length) return;

      const L = rows.length;
      if (L % 2 === 0) return; // expect 2N+1 rows; bail if something is wrong
      const N = (L - 1) / 2;  // half-dimension: diamond spans h^{p,q} with p,q in [0,N]

      rows.forEach((row, idxTop) => {
        const r = (L - 1) - idxTop;  // antidiagonal: bottom row → r=0, top row → r=2N

        const spans = Array.from(
          row.querySelectorAll(".diamond-value, .hodge-cell, span")
        ).filter(el => el.textContent && el.textContent.trim() !== "");
        if (!spans.length) return;

        const iMin = Math.max(0, r - N);
        const iMax = Math.min(r, N);

        // Leftmost span has i = iMax; i decreases by 1 per step going right
        spans.forEach((span, s) => {
          const i = iMax - s;
          const j = r - i;

          if (i < 0 || j < 0 || i > N || j > N) return;

          span.dataset.i = String(i);
          span.dataset.j = String(j);
          span.title = `(${i}, ${j})`;  // native hover tooltip
        });
      });
    }


    function annotateAllDiamondCoords() {
      diamondRoots.forEach(annotateDiamondCoords);
    }

    // Mark any element whose visible text is exactly "0"
    function labelZeros(root) {
      if (!root) return;
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

    // Mark the top half (excluding the middle row) of each diamond
    function labelTopHalf(root) {
      if (!root) return;

      const rows = Array.from(
        root.querySelectorAll(".hodge-row, .diamond-row")
      );
      if (!rows.length) return;

      // querySelectorAll returns DOM order (top→bottom), no position sort needed
      const mid = Math.floor(rows.length / 2);

      rows.forEach((row, idx) => {
        if (idx < mid) {
          row.classList.add("is-top-half");
        } else {
          row.classList.remove("is-top-half");
        }
      });
    }

    function relabelAllZeros() {
      diamondRoots.forEach(labelZeros);
    }

    function relabelAllTopHalf() {
      diamondRoots.forEach(labelTopHalf);
    }

    // Scroll #diamond-box so the diamond peak is centred in the visible area.
    // Only activates when the diamond is wider than the box.
    function centreDiamondScroll(root) {
      const wrapper = root.closest('.diamond-scroll-wrapper');
      if (!wrapper) return;
      requestAnimationFrame(() => {
        const overflow = wrapper.scrollWidth - wrapper.clientWidth;
        wrapper.scrollLeft = overflow > 0 ? overflow / 2 : 0;
      });
    }

    // Mutation observer: now also annotates coordinates
    const observers = diamondRoots.map(root => {
      const obs = new MutationObserver(() => {
        annotateDiamondCoords(root);  // NEW
        if (document.body.classList.contains("zero-alt-on")) labelZeros(root);
        labelTopHalf(root);
        centreDiamondScroll(root);
      });
      obs.observe(root, { childList: true, subtree: true });
      return obs;
    });

    window.addEventListener('beforeunload', () => observers.forEach(o => o.disconnect()));

    if (zeroToggle) {
      zeroToggle.addEventListener("change", () => {
        const on = zeroToggle.checked;
        document.body.classList.toggle("zero-alt-on", on);
        if (on) relabelAllZeros();
      });
    }

    const hideTopHalfToggle = document.getElementById("hide-top-half-toggle");

    if (hideTopHalfToggle) {
      hideTopHalfToggle.addEventListener("change", () => {
        const on = hideTopHalfToggle.checked;
        document.body.classList.toggle("hide-top-half", on);
        if (on) {
          relabelAllTopHalf();
        }
      });
    }

    const showBlowupsToggle = document.getElementById("show-blowups-toggle");
    if (showBlowupsToggle) {
      showBlowupsToggle.addEventListener("change", () => {
        document.body.classList.toggle("show-blowups", showBlowupsToggle.checked);
      });
    }

    // Initial pass
    annotateAllDiamondCoords();   // NEW

    if (zeroToggle?.checked) {
      document.body.classList.add("zero-alt-on");
      relabelAllZeros();
    }

    if (hideTopHalfToggle?.checked) {
      document.body.classList.add("hide-top-half");
      relabelAllTopHalf();
    } else {
      relabelAllTopHalf();
    }

    if (showBlowupsToggle?.checked) {
      document.body.classList.add("show-blowups");
    }

    updateHodgeDiamondDescription();

    // --- URL State: encode current calculator state into query params ---
    function encodeState() {
        const params = new URLSearchParams();

        let calc = 'ci';
        if (abelianVarietyContainer.style.display !== 'none')          calc = 'abelian';
        else if (grassmannianContainer.style.display !== 'none')       calc = 'grassmannian';
        else if (flagContainer.style.display !== 'none')               calc = 'flag';
        else if (twistedContainer.style.display !== 'none')            calc = 'twisted';
        else if (productGrassmannianContainer?.style.display !== 'none') calc = 'product';
        params.set('calc', calc);

        if (calc === 'ci') {
            params.set('n', document.getElementById('n-value').value);
            const r = document.getElementById('r-value').value;
            params.set('r', r);
            if (parseInt(r) > 0) {
                const degs = Array.from(document.querySelectorAll('#degree-toggles .hodge-input')).map(i => i.value);
                if (degs.length) params.set('deg', degs.join(','));
            }
            const s = document.getElementById('s-value')?.value;
            if (s && s !== '0') params.set('s', s);

        } else if (calc === 'abelian') {
            params.set('g', document.getElementById('g-value').value);

        } else if (calc === 'grassmannian') {
            params.set('n', document.getElementById('n-value-grassmannian').value);
            params.set('k', document.getElementById('k-value-grassmannian').value);
            const r = document.getElementById('r-value-grassmannian').value;
            params.set('r', r);
            if (parseInt(r) > 0) {
                const degs = Array.from(document.querySelectorAll('#degree-toggles-grassmannian .hodge-input')).map(i => i.value);
                if (degs.length) params.set('deg', degs.join(','));
            }
            const s = document.getElementById('s-value-grassmannian')?.value;
            if (s && s !== '0') params.set('s', s);

        } else if (calc === 'flag') {
            params.set('dims', (document.getElementById('dims-input')?.value ?? '').replace(/\s/g, ''));
            params.set('r', document.getElementById('r-value-flag')?.value ?? '0');
            const flagInputs = document.querySelectorAll('#degree-toggles-flag .hodge-input');
            if (flagInputs.length) {
                params.set('md', Array.from(flagInputs).map(i => i.value.replace(/\s/g, '')).join('|'));
            }

        } else if (calc === 'twisted') {
            params.set('n', document.getElementById('n-value-twisted').value);
            params.set('k', document.getElementById('k-value-twisted').value);
            params.set('t', document.getElementById('t-value-twisted').value);

        } else if (calc === 'product') {
            const factorRows = document.querySelectorAll('#factor-inputs-product .factor-row-product');
            const pairs = Array.from(factorRows).map(row =>
                row.querySelector('.factor-k-value').value + ',' + row.querySelector('.factor-n-value').value
            );
            params.set('factors', pairs.join(','));
            const r = document.getElementById('r-value-product')?.value ?? '0';
            params.set('r', r);
            if (parseInt(r) > 0) {
                const degRows = document.querySelectorAll('#degree-toggles-product .degree-toggle');
                const tuples = Array.from(degRows).map(row =>
                    Array.from(row.querySelectorAll('.hodge-input')).map(i => i.value).join(',')
                );
                if (tuples.length) params.set('md', tuples.join('|'));
            }
        }

        if (document.getElementById('zero-color-toggle')?.checked)  params.set('color', '1');
        if (document.getElementById('hide-top-half-toggle')?.checked) params.set('half', '1');
        if (document.getElementById('show-blowups-toggle')?.checked) params.set('blowups', '1');

        return params;
    }

    // --- URL State: restore calculator state from query params on page load ---
    function decodeState() {
        const params = new URLSearchParams(window.location.search);
        const calc = params.get('calc');
        if (!calc) return;

        function fire(el) { el?.dispatchEvent(new Event('input', { bubbles: true })); }
        function setVal(id, val) {
            if (val === null) return;
            const el = document.getElementById(id);
            if (el) { el.value = val; fire(el); }
        }

        // Switch to the requested tab (CI is already active by default so skip its click)
        const tabBtns = { abelian: toggleAbelianVariety, grassmannian: toggleGrassmannian,
                          flag: toggleFlag, twisted: toggleTwisted, product: toggleProductGrassmannian };
        if (tabBtns[calc]) tabBtns[calc].click();

        if (calc === 'ci') {
            setVal('n-value', params.get('n'));
            setVal('r-value', params.get('r'));
            setVal('s-value', params.get('s') ?? '0');
            const deg = params.get('deg');
            if (deg) {
                requestAnimationFrame(() => {
                    const inputs = document.querySelectorAll('#degree-toggles .hodge-input');
                    deg.split(',').forEach((d, i) => {
                        if (inputs[i]) { inputs[i].value = d; fire(inputs[i]); }
                    });
                });
            }

        } else if (calc === 'abelian') {
            setVal('g-value', params.get('g'));

        } else if (calc === 'grassmannian') {
            setVal('n-value-grassmannian', params.get('n'));
            setVal('k-value-grassmannian', params.get('k'));
            setVal('r-value-grassmannian', params.get('r'));
            setVal('s-value-grassmannian', params.get('s') ?? '0');
            const deg = params.get('deg');
            if (deg) {
                requestAnimationFrame(() => {
                    const inputs = document.querySelectorAll('#degree-toggles-grassmannian .hodge-input');
                    deg.split(',').forEach((d, i) => {
                        if (inputs[i]) { inputs[i].value = d; fire(inputs[i]); }
                    });
                });
            }

        } else if (calc === 'flag') {
            // Flag is lazily loaded; wait for the async import triggered by clicking toggle-flag
            setTimeout(() => {
                setVal('dims-input', (params.get('dims') ?? '').replace(/,/g, ', '));
                setVal('r-value-flag', params.get('r'));
                const md = params.get('md');
                if (md) {
                    setTimeout(() => {
                        const inputs = document.querySelectorAll('#degree-toggles-flag .hodge-input');
                        md.split('|').forEach((val, i) => {
                            if (inputs[i]) { inputs[i].value = val; fire(inputs[i]); }
                        });
                    }, 200);
                }
            }, 500);

        } else if (calc === 'twisted') {
            setVal('n-value-twisted', params.get('n'));
            setVal('k-value-twisted', params.get('k'));
            setVal('t-value-twisted', params.get('t'));

        } else if (calc === 'product') {
            const factorsStr = params.get('factors');
            if (factorsStr && productGrassmannianContainer?._loadPreset) {
                const flat = factorsStr.split(',').map(Number);
                const factors = [];
                for (let i = 0; i + 1 < flat.length; i += 2) factors.push({ k: flat[i], n: flat[i + 1] });
                const rNum = parseInt(params.get('r')) || 0;
                const md = params.get('md');
                const degrees = md ? md.split('|').map(row => row.split(',').map(Number)) : [];
                productGrassmannianContainer._loadPreset(factors, rNum, degrees);
            }
        }

        if (params.get('color') === '1') {
            const el = document.getElementById('zero-color-toggle');
            if (el) { el.checked = true; el.dispatchEvent(new Event('change')); }
        }
        if (params.get('half') === '1') {
            const el = document.getElementById('hide-top-half-toggle');
            if (el) { el.checked = true; el.dispatchEvent(new Event('change')); }
        }
        if (params.get('blowups') === '1') {
            const el = document.getElementById('show-blowups-toggle');
            if (el) { el.checked = true; el.dispatchEvent(new Event('change')); }
        }
    }

    // Keep the URL in sync with the current calculator state as inputs change
    let _urlUpdateTimer = null;
    function scheduleUrlUpdate() {
        clearTimeout(_urlUpdateTimer);
        _urlUpdateTimer = setTimeout(() => {
            const params = encodeState();
            history.replaceState(history.state, '', '/hodge?' + params.toString());
        }, 300);
    }
    document.getElementById('app')?.addEventListener('input', scheduleUrlUpdate);
    document.getElementById('app')?.addEventListener('change', scheduleUrlUpdate);
    document.getElementById('app')?.addEventListener('click', (e) => {
        if (e.target.closest('.preset-button')) scheduleUrlUpdate();
    });
    // Also update when switching tabs (tab buttons fire click, not input)
    [toggleCompleteIntersection, toggleAbelianVariety, toggleGrassmannian,
     toggleFlag, toggleTwisted, toggleProductGrassmannian].forEach(btn => {
        btn?.addEventListener('click', () => setTimeout(scheduleUrlUpdate, 0));
    });
    ['add-factor-product', 'remove-factor-product'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', scheduleUrlUpdate);
    });

    // Copy Link button: encode state to URL, update address bar, copy to clipboard
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            clearTimeout(_urlUpdateTimer);
            const params = encodeState();
            const search = '?' + params.toString();
            const fullUrl = window.location.origin + '/hodge' + search;
            history.replaceState(history.state, '', '/hodge' + search);

            const flash = (ok) => {
                const orig = copyLinkBtn.textContent;
                copyLinkBtn.textContent = ok ? 'Copied!' : 'Copy failed';
                copyLinkBtn.disabled = true;
                setTimeout(() => { copyLinkBtn.textContent = orig; copyLinkBtn.disabled = false; }, 1500);
            };

            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(fullUrl).then(() => flash(true)).catch(() => flash(false));
            } else {
                // Fallback for browsers without clipboard API
                const ta = document.createElement('textarea');
                ta.value = fullUrl;
                ta.style.cssText = 'position:fixed;opacity:0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); flash(true); } catch { flash(false); }
                document.body.removeChild(ta);
            }
        });
    }

    // Restore state from URL query params (shared links, back-button navigation)
    decodeState();

}
