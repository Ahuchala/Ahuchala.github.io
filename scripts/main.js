const scriptsLoaded = [];

import { setComponents } from "../components/setComponents.js";

setComponents();

export function loadScript(src, isModule = false)
{
    return new Promise((resolve, reject) =>
    {
        if (scriptsLoaded[src])
        {
            resolve();
            return;
        }

        const script = document.createElement("script");

        if (isModule)
        {
            script.setAttribute("type", "module");
        }

        document.body.appendChild(script);

        script.onload = () =>
        {
            scriptsLoaded[src] = true;

            resolve();
        };

        script.onerror = reject;
        script.async = true;
        script.src = src;
    });
}

// MathJax!
window.MathJax = {
    tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]],
    },
    svg: {
        fontCache: "global",
    },
};

// Load MathJax script
loadScript("https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-mml-chtml.js")
