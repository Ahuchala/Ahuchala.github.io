import { hodgeDiamondCI, applyBlowUp } from "/components/hodge/chiGrassmannianCI.js";
import { debounce } from "/scripts/utils.js";

// Persistent Worker for the CI Hodge computation. Created lazily on first
// init() call and kept alive for the full session so its module-level
// memoization cache survives SPA navigations back to this page.
let _ciWorker = null;
function getCIWorker() {
    if (!_ciWorker && typeof Worker !== "undefined") {
        _ciWorker = new Worker("/components/hodge/hodgeCIWorker.js", { type: "module" });
    }
    return _ciWorker;
}

export function init() {
    const nSlider = document.getElementById("n-slider");
    const rSlider = document.getElementById("r-slider");
    const nValue  = document.getElementById("n-value");
    const rValue  = document.getElementById("r-value");
    const degreeToggles = document.getElementById("degree-toggles");
    const diamondContainer = document.getElementById("diamond-container");
    const sSlider = document.getElementById("s-slider");
    const sValue  = document.getElementById("s-value");

    const presetButtons = document.querySelectorAll(".preset-button");
    let lastUserSetR = parseInt(rSlider.value, 10) || 0; // Tracks last user-set value of r
    let _gen = 0; // Incremented on each compute request; used to discard stale Worker responses

    // --- slider/textbox sync that allows blank, with configurable min/max ---
    // input events (slider drag, typing) are debounced 40 ms so the diamond
    // is only recomputed after the user pauses — not 60× per second while
    // dragging. blur is kept immediate so fields snap when the user tabs away.
    const syncSliderAndTextbox = (slider, textbox, onChange, minVal = 0, maxVal = 50) => {
        const debouncedOnChange = debounce(onChange, 40);

        // slider → textbox
        slider.addEventListener("input", () => {
            const v = Number(slider.value);
            const clamped = Math.max(minVal, Math.min(v, maxVal));
            slider.value = String(clamped);
            textbox.value = String(clamped);
            debouncedOnChange();
        });

        // textbox typing: allow blank, don't touch the slider or diamond until numeric
        textbox.addEventListener("input", () => {
            const raw = textbox.value.trim();
            if (raw === "") {
                // user is mid-edit; keep current diamond
                return;
            }
            let num = parseInt(raw, 10);
            if (!Number.isFinite(num)) {
                num = minVal;
            }
            const clamped = Math.max(minVal, Math.min(num, maxVal));
            textbox.value = String(clamped);
            slider.value = String(Math.max(minVal, Math.min(clamped, Number(slider.max))));
            debouncedOnChange();
        });

        // on blur: if still blank, restore from slider; otherwise normalize (immediate)
        textbox.addEventListener("blur", () => {
            let raw = textbox.value.trim();
            if (raw === "") {
                raw = slider.value;
            }
            let num = parseInt(raw, 10);
            if (!Number.isFinite(num)) {
                num = minVal;
            }
            const clamped = Math.max(minVal, Math.min(num, maxVal));
            textbox.value = String(clamped);
            slider.value = String(Math.max(minVal, Math.min(clamped, Number(slider.max))));
            onChange();
        });
    };

    const updateRSlider = () => {
        const n = parseInt(nValue.value, 10);
        const safeN = Number.isFinite(n) ? n : 0;
        const newR = Math.min(lastUserSetR, safeN);  // ensure 0 ≤ r ≤ n

        rSlider.max = String(Math.min(10, safeN));   // slider max = min(10, n)
        rSlider.value = String(newR);
        rValue.value  = String(newR);

        updateDegreeToggles(newR);
    };

    const updateDegreeToggles = (r) => {
        const currentCount = degreeToggles.children.length;
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

                input.addEventListener("input", () => debouncedUpdateDiamond());

                toggleContainer.appendChild(label);
                toggleContainer.appendChild(input);
                degreeToggles.appendChild(toggleContainer);
            }
        } else if (r < currentCount) {
            for (let i = currentCount - 1; i >= r; i--) {
                degreeToggles.children[i].remove();
            }
        }
    };

    const updateDiamond = () => {
        const n = parseInt(nValue.value, 10);
        const r = parseInt(rValue.value, 10);

        // Basic sanity check on n, r
        if (!Number.isFinite(n) || !Number.isFinite(r) || n < 0 || r < 0) {
            diamondContainer.innerHTML =
                `<p class="placeholder">Enter n and r (or use sliders) to see the Hodge diamond.</p>`;
            return;
        }

        const s = Math.max(0, parseInt(sValue.value, 10) || 0);
        const dim = n - r;
        const rows = 2 * dim + 1;
        const targetRowIndex = dim;

        // If rows is nonsense (e.g. r > n), just show a placeholder
        if (rows <= 0 || targetRowIndex < 0) {
            diamondContainer.innerHTML =
                `<p class="placeholder">Choose n and r with 0 ≤ r ≤ n to see the Hodge diamond.</p>`;
            return;
        }

        diamondContainer.innerHTML = "";

        // Helper: read and validate degrees array (positive integers)
        const readDegrees = () => {
            const inputs = Array.from(
                degreeToggles.querySelectorAll(".hodge-input")
            );
            if (inputs.length === 0) {
                return { ok: false, degrees: [] };
            }
            const degrees = [];
            for (const inp of inputs) {
                const raw = (inp.value ?? "").trim();
                if (raw === "") {
                    return { ok: false, degrees: [] };
                }
                const d = parseInt(raw, 10);
                // Degrees must be ≥ 1
                if (!Number.isFinite(d) || d <= 0) {
                    return { ok: false, degrees: [] };
                }
                degrees.push(d);
            }
            return { ok: true, degrees };
        };

        // Special case: r = n → 0-dim complete intersection (finite set of points)
        if (r === n) {
            const { ok, degrees } = readDegrees();
            if (!ok) {
                diamondContainer.innerHTML =
                    `<p class="placeholder">Enter positive degrees for all hypersurfaces to see the Hodge diamond.</p>`;
                return;
            }

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

        // Special case: r = 0 → projective space P^n
        if (r === 0) {
            for (let j = 0; j < rows; j++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                const elements = j <= dim ? j + 1 : rows - j;
                const spaces = (rows - elements) / 2;

                for (let sp = 0; sp < spaces; sp++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                for (let i = 0; i < elements; i++) {
                    const valEl = document.createElement("span");
                    valEl.className = "diamond-value";
                    const condition = 2 * i === Math.min(j, 2 * dim - j);
                    if (condition) {
                        const mirrorJ = Math.min(j, 2 * dim - j);
                        const p = mirrorJ / 2;
                        valEl.innerText = String(1 + (p >= 1 && p <= dim - 1 ? s : 0));
                    } else {
                        valEl.innerText = "0";
                    }
                    row.appendChild(valEl);
                }

                for (let sp = 0; sp < spaces; sp++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                diamondContainer.appendChild(row);
            }
            return;
        }

        // General complete intersection case: 1 ≤ r ≤ n-1
        const { ok, degrees } = readDegrees();
        if (!ok) {
            diamondContainer.innerHTML =
                `<p class="placeholder">Enter positive degrees for all ${r} hypersurfaces to see the Hodge diamond.</p>`;
            return;
        }

        // Render a pre-computed blown diamond into a container.
        const renderBlownDiamond = (diamond, container) => {
            container.innerHTML = "";
            for (let j = 0; j < rows; j++) {
                const row = document.createElement("div");
                row.className = "diamond-row";

                const elements = j <= dim ? j + 1 : 2 * dim - j + 1;
                const spaces = (rows - elements) / 2;

                for (let sp = 0; sp < spaces; sp++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                for (let i = 0; i < elements; i++) {
                    const valEl = document.createElement("span");
                    valEl.className = "diamond-value";
                    valEl.innerText = diamond[j]?.[i] ?? 0;
                    row.appendChild(valEl);
                }

                for (let sp = 0; sp < spaces; sp++) {
                    const space = document.createElement("span");
                    space.className = "diamond-space";
                    row.appendChild(space);
                }

                container.appendChild(row);
            }
        };

        const gen = ++_gen;
        const worker = getCIWorker();

        if (worker) {
            // Off-load computation to Worker so the main thread stays responsive.
            // The generation counter discards responses from superseded requests.
            diamondContainer.classList.add("diamond-loading");
            worker.onmessage = ({ data }) => {
                if (data.gen !== gen) return; // stale — a newer request is already in flight
                diamondContainer.classList.remove("diamond-loading");
                if (!data.ok) {
                    console.error("hodgeDiamondCI Worker error:", data.error);
                    diamondContainer.innerHTML =
                        `<p class="placeholder">Unable to compute the Hodge diamond for these parameters.</p>`;
                    return;
                }
                renderBlownDiamond(data.diamond, diamondContainer);
            };
            worker.postMessage({ k: 1, n: n + 1, degrees, s, dim, gen });
        } else {
            // Fallback: synchronous computation (e.g. Workers unavailable in this environment).
            try {
                const diamond = applyBlowUp(hodgeDiamondCI(1, n + 1, degrees), s, dim);
                renderBlownDiamond(diamond, diamondContainer);
            } catch (e) {
                console.error("hodgeDiamondCI error:", e);
                diamondContainer.innerHTML =
                    `<p class="placeholder">Unable to compute the Hodge diamond for these parameters.</p>`;
            }
        }
    };

    // Debounced wrapper used by degree-input listeners (created after updateDiamond
    // so the closure captures the fully-initialized function reference).
    const debouncedUpdateDiamond = debounce(updateDiamond, 40);

    const loadPreset = (n, r, degrees) => {
        nValue.value = String(n);
        nSlider.value = String(Math.min(n, Number(nSlider.max)));
        sValue.value = "0";
        sSlider.value = "0";

        lastUserSetR = r; // Remember the preset r
        updateRSlider();
        updateDegreeToggles(r);

        const inputs = degreeToggles.querySelectorAll(".hodge-input");
        degrees.forEach((deg, i) => {
            if (inputs[i]) {
                inputs[i].value = String(deg);
            }
        });

        updateDiamond();
    };

    presetButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!button.dataset.n || !button.dataset.r || !button.dataset.degrees) return;

            const n = parseInt(button.dataset.n, 10);
            const r = parseInt(button.dataset.r, 10);
            const degrees = button.dataset.degrees.split(",").map(Number);
            loadPreset(n, r, degrees);
        });
    });

    // Initialize sliders and textboxes
    syncSliderAndTextbox(
        nSlider,
        nValue,
        () => {
            updateRSlider();
            updateDiamond();
        },
        0,  // allow n = 0
        50
    );

    syncSliderAndTextbox(
        rSlider,
        rValue,
        () => {
            lastUserSetR = parseInt(rValue.value, 10) || 0;
            updateDegreeToggles(lastUserSetR);
            updateDiamond();
        },
        0,  // allow r = 0
        50
    );

    syncSliderAndTextbox(sSlider, sValue, updateDiamond, 0, 1000);

    // Default preset
    loadPreset(4, 2, [3, 2]);
}
