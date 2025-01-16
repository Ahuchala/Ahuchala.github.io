// File: /scripts/main.js

/*****************************************************
 * IMPORTS
 *****************************************************/
import { setComponents } from "/components/setComponents.js";
import { initModal, initMenuToggle, initSettings } from "/scripts.js";

/*****************************************************
 * UTILITY: LOAD SCRIPT DYNAMICALLY
 *****************************************************/
const scriptsLoaded = [];

export function loadScript(src, isModule = false) {
  return new Promise((resolve, reject) => {
    if (scriptsLoaded[src]) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    if (isModule) {
      script.type = "module";
    }

    document.body.appendChild(script);

    script.onload = () => {
      scriptsLoaded[src] = true;
      resolve();
    };

    script.onerror = reject;
    script.async = true;
    script.src = src;
  });
}

/*****************************************************
 * DOMContentLoaded: DO ALL THE THINGS
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {

  // 1) Set up your header/footer, etc.
  setComponents();

  // 2) Load MathJax (only once)
  window.MathJax = {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]]
      // packages: ["base"]
    },
    svg: {
      fontCache: "global"
    }
  };

  loadScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js")
    .then(() => {
      console.log("MathJax loaded successfully.");
    })
    .catch((err) => {
      console.error("Error loading MathJax:", err);
    });

  // 3) Initialize your other scripts
  initModal();
  initMenuToggle();
  initSettings();
});
