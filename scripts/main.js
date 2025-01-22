/*****************************************************
 * IMPORTS
 *****************************************************/
import { setComponents } from "/components/setComponents.js";
import { initModal, initMenuToggle, initSettings } from "/scripts.js";

import { images } from '/components/gallery.js';


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
{/* <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.5.0/math.min.js"></script> */}
  loadScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js")
    // .then(() => {
    //   console.log("MathJax loaded successfully.");
    // })
    .catch((err) => {
      console.error("Error loading MathJax:", err);
    });

  // 3) Initialize your other scripts
  initModal();
  initMenuToggle();
  initSettings();
});

// unclear if this does anything
document.addEventListener("DOMContentLoaded", () => {
  // Get the computed background color from CSS
  const backgroundColor = getComputedStyle(document.body).getPropertyValue('--body-bg').trim();

  // Find the <meta name="theme-color"> tag
  let themeMetaTag = document.querySelector('meta[name="theme-color"]');

  // If the tag exists, update its content; otherwise, create one
  if (themeMetaTag) {
      themeMetaTag.setAttribute('content', backgroundColor);
  } else {
      themeMetaTag = document.createElement('meta');
      themeMetaTag.setAttribute('name', 'theme-color');
      themeMetaTag.setAttribute('content', backgroundColor);
      document.head.appendChild(themeMetaTag);
  }
});
