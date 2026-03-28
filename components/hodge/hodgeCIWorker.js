// hodgeCIWorker.js — Module Worker for the CI Hodge diamond computation.
//
// Runs hodgeDiamondCI + applyBlowUp off the main thread so large computations
// (high n, many high-degree hypersurfaces) never block slider interactions.
//
// This module imports from chiGrassmannianCI.js, which has its own module-level
// memoization Map (_hodgeCICache). Because the Map lives inside this Worker
// context, it persists across compute requests — repeated identical inputs
// (e.g. dragging the s slider while n and degrees stay fixed) return instantly.
//
// Message protocol
//   Receives: { k, n, degrees, s, dim, gen }
//   Posts:    { ok: true,  diamond, gen }
//          or { ok: false, error: <string>, gen }
//
// The `gen` field echoes the request's generation counter back so the main
// thread can discard responses from superseded (stale) requests.

import { hodgeDiamondCI, applyBlowUp } from '/components/hodge/chiGrassmannianCI.js'

self.onmessage = ({ data }) => {
  const { k, n, degrees, s, dim, gen } = data
  try {
    const raw = hodgeDiamondCI(k, n, degrees)
    const diamond = applyBlowUp(raw, s, dim)
    self.postMessage({ ok: true, diamond, gen })
  } catch (e) {
    self.postMessage({ ok: false, error: e.message, gen })
  }
}
