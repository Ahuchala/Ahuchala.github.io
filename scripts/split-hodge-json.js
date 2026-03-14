#!/usr/bin/env node
/**
 * split-hodge-json.js
 *
 * One-time script: splits the monolithic Hodge JSON data files into
 * individual per-key files for lazy loading.
 *
 * Grassmannian: "k,n,r" → grassmannian-hodge/k{k}_n{n}_r{r}.json
 * Flag:         "[d1, d2, d3],r" → flag-hodge/dims{d1}_{d2}_{d3}_r{r}.json
 *
 * Usage: node scripts/split-hodge-json.js
 */

const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "../components/hodge");

// ── Grassmannian ──────────────────────────────────────────────────────────────
const grassSrc = path.join(base, "grassmannian_hodge_numbers_factored.json");
const grassOut = path.join(base, "grassmannian-hodge");

if (fs.existsSync(grassSrc)) {
  fs.mkdirSync(grassOut, { recursive: true });
  const data = JSON.parse(fs.readFileSync(grassSrc, "utf8"));
  let count = 0;
  for (const [key, val] of Object.entries(data)) {
    const [k, n, r] = key.split(",");
    const fname = `k${k}_n${n}_r${r}.json`;
    fs.writeFileSync(path.join(grassOut, fname), JSON.stringify(val));
    count++;
  }
  console.log(`Grassmannian: wrote ${count} files → ${grassOut}`);
} else {
  console.warn(`Grassmannian source not found: ${grassSrc}`);
}

// ── Flag ──────────────────────────────────────────────────────────────────────
const flagSrc = path.join(base, "flag_hodge_numbers_factored.json");
const flagOut = path.join(base, "flag-hodge");

if (fs.existsSync(flagSrc)) {
  fs.mkdirSync(flagOut, { recursive: true });
  const data = JSON.parse(fs.readFileSync(flagSrc, "utf8"));
  let count = 0;
  for (const [key, val] of Object.entries(data)) {
    // key looks like "[1, 1, 1],2"
    // Extract dims array and r
    const match = key.match(/^\[([^\]]+)\],(\d+)$/);
    if (!match) { console.warn(`Skipping unexpected flag key: ${key}`); continue; }
    const dims = match[1].replace(/\s/g, "").replace(/,/g, "_");
    const r = match[2];
    const fname = `dims${dims}_r${r}.json`;
    fs.writeFileSync(path.join(flagOut, fname), JSON.stringify(val));
    count++;
  }
  console.log(`Flag: wrote ${count} files → ${flagOut}`);
} else {
  console.warn(`Flag source not found: ${flagSrc}`);
}
