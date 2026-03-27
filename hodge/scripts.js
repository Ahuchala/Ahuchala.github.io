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

    // Align the default-visible container on first paint.
    requestAnimationFrame(() => alignLabelsInContainer(completeIntersectionContainer));

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
        if ( t === 0) {
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

    // NEW: annotate (i,j) coordinates + title for ALL diamonds
    function annotateDiamondCoords(root) {
      if (!root) return;

      const rows = Array.from(
        root.querySelectorAll(".hodge-row, .diamond-row")
      );
      if (!rows.length) return;

      // querySelectorAll returns DOM order (top→bottom)

      const L = rows.length;
      if (L % 2 === 0) return; // expect 2N+1 rows
      const N = (L - 1) / 2;

      rows.forEach((row, idxTop) => {
        // r = i + j, with bottom row having r = 0
        const r = (L - 1) - idxTop;  // bottom-most row → r = 0

        const spans = Array.from(
          row.querySelectorAll(".diamond-value, .hodge-cell, span")
        ).filter(el => el.textContent && el.textContent.trim() !== "");
        if (!spans.length) return;

        const iMin = Math.max(0, r - N);
        const iMax = Math.min(r, N);

        // In your convention, **leftmost has largest i** (iMax),
        // rightmost has smallest i (iMin).
        spans.forEach((span, s) => {
          const i = iMax - s;      // i decreases left → right
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

    updateHodgeDiamondDescription();


    // Prevent scroll wheel from changing number-input values.
    // preventDefault() blocks the value change; we then forward the delta to the
    // page manually so scrolling still works. The input stays focused, so
    // keyboard arrow keys continue to change the value as expected.
    document.addEventListener("wheel", (e) => {
      if (e.target.type === "number") {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "instant" });
      }
    }, { passive: false });
}
