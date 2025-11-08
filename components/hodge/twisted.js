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
    slider.addEventListener("input", () => {
      textbox.value = slider.value;
      onChange();
    });
    slider.addEventListener("change", () => {
      textbox.value = slider.value;
      onChange();
    });
    textbox.addEventListener("input", () => {
      const textMin = parseInt(textbox.min);
      const textMax = parseInt(textbox.max);
      const sliderMin = parseInt(slider.min);
      const sliderMax = parseInt(slider.max);
      const value = Math.max(textMin, Math.min(parseInt(textbox.value) || textMin, textMax));
      textbox.value = value;
      slider.value = Math.max(sliderMin, Math.min(value, sliderMax));
      onChange();
    });
    textbox.addEventListener("blur", () => {
      if (textbox.value === "") textbox.value = slider.value;
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
