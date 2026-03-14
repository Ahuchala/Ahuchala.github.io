/**
 * loadMath.js — lazy-loads math.js from CDN on first call.
 * Returns a Promise that resolves once the global `math` object is ready.
 * Subsequent calls return the same already-resolved Promise.
 */

const MATH_CDN = "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.5.0/math.min.js";
const MATH_SRI = "sha384-uBeA0M589wc4GDD7J3f1UGW7Sks8AfUHVvIRockp1uaw2uPlx0oRKWZF/ljn/Nul";

let mathPromise = null;

export function ensureMath() {
  if (typeof math !== "undefined") return Promise.resolve();
  if (mathPromise) return mathPromise;

  mathPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MATH_CDN;
    script.integrity = MATH_SRI;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load math.js from CDN"));
    document.head.appendChild(script);
  });

  return mathPromise;
}
