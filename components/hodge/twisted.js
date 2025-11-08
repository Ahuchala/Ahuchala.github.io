import { hodgeTwisted } from "/components/hodge/twistedHodge.js";

document.addEventListener("DOMContentLoaded", async () => {
  const nSliderTwisted = document.getElementById("n-slider-twisted");
  const kSliderTwisted = document.getElementById("k-slider-twisted");
  const tSliderTwisted = document.getElementById("t-slider-twisted");
  const nValueTwisted = document.getElementById("n-value-twisted");
  const kValueTwisted = document.getElementById("k-value-twisted");
  const tValueTwisted = document.getElementById("t-value-twisted");
  const diamondContainerTwisted = document.getElementById("diamond-container-twisted");

  const syncSliderAndTextbox = (slider, textbox, onChange) => {
  let syncing = false; // prevent feedback loops

  // When the SLIDER moves, force the textbox to exactly the slider value.
  slider.addEventListener("input", () => {
    if (syncing) return;
    syncing = true;
    const v = Number(slider.value);
    textbox.value = String(v);
    onChange();
    syncing = false;
  });

  // Optionally keep this if you care about slider's "change" (mouseup) too:
  slider.addEventListener("change", () => {
    if (syncing) return;
    syncing = true;
    const v = Number(slider.value);
    textbox.value = String(v);
    onChange();
    syncing = false;
  });

  // When the TEXTBOX changes, don't force weird fallbacks.
  // If it's a valid number, clamp ONLY to the textbox's own min/max,
  // and move the slider ONLY if within the slider's range.
  textbox.addEventListener("input", () => {
    if (syncing) return;
    const parsed = Number(textbox.value);
    if (!Number.isFinite(parsed)) return; // don't coerce to min/max on partial input

    const tbMin = Number(textbox.min);
    const tbMax = Number(textbox.max);
    const clampedTb = Math.max(tbMin, Math.min(parsed, tbMax));

    const slMin = Number(slider.min);
    const slMax = Number(slider.max);

    syncing = true;
    textbox.value = String(clampedTb);

    // Only move the slider if inside its range; otherwise leave it at its end.
    if (clampedTb >= slMin && clampedTb <= slMax) {
      slider.value = String(clampedTb);
    }
    onChange();
    syncing = false;
  });

  textbox.addEventListener("blur", () => {
    if (textbox.value === "") {
      // On blur, snap empty to current slider (no jumps)
      textbox.value = slider.value;
    }
  });
};



  const updateDiamondTwisted = () => {
    const n = parseInt(nValueTwisted.value);
    const k = parseInt(kValueTwisted.value);
    const t = parseInt(tValueTwisted.value);

    const N = k * (n - k);
    if (N < 0 || isNaN(n) || isNaN(k) || isNaN(t)) {
      diamondContainerTwisted.innerHTML = `<p class="error">Error: Invalid parameters.</p>`;
      return;
    }

    // hodgeTwisted returns { i, j, lambda, beta, dimension }
    const results = hodgeTwisted(k, n, t);

    // h^{i,j} = sum of dimensions, stored as BigInt
    const hij = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0n));

    for (const { i, j, dimension } of results || []) {
      if (i >= 0 && j >= 0 && i <= N && j <= N) {
        const dimBig = (typeof dimension === "bigint") ? dimension : BigInt(dimension);
        hij[i][j] += dimBig; // BigInt-safe addition
      }
    }

    // Build 2N+1 rows. Row r shows h^{0,r}, h^{1,r-1}, ..., h^{r,0}.
    // Include rows for i+j > N as well (so full diamond appears).
    diamondContainerTwisted.innerHTML = "";

    for (let r = 0; r <= 2 * N; r++) {
      const row = document.createElement("div");
      row.className = "diamond-row";

      const iMin = Math.max(0, r - N);
      const iMax = Math.min(r, N);

      for (let i = iMin; i <= iMax; i++) {
        const j = r - i;
        let val = 0n;

        if (i >= 0 && i <= N && j >= 0 && j <= N) {
          val = hij[i][j];
        }

        const valueCell = document.createElement("span");
        valueCell.className = "diamond-value";
        valueCell.innerText = val.toString();
        row.appendChild(valueCell);
      }

      diamondContainerTwisted.appendChild(row);
    }
  };

  syncSliderAndTextbox(nSliderTwisted, nValueTwisted, updateDiamondTwisted);
  syncSliderAndTextbox(kSliderTwisted, kValueTwisted, updateDiamondTwisted);
  syncSliderAndTextbox(tSliderTwisted, tValueTwisted, updateDiamondTwisted);

  updateDiamondTwisted();
});
