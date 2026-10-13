const express = require('express');
const { refreshFlights, getFlightsSnapshot, applyFilters, getStatus } = require('../services/flightService');
const router = express.Router();

function parseBBox(q) {
  const { lamin, lamax, lomin, lomax } = q;
  if (lamin == null || lamax == null || lomin == null || lomax == null) return null;
  const b = { lamin: +lamin, lamax: +lamax, lomin: +lomin, lomax: +lomax };
  if (Object.values(b).some(v => !Number.isFinite(v))) return null;
  if (b.lamin >= b.lamax || b.lomin >= b.lomax) return null;
  if (b.lamin < -90 || b.lamax > 90 || b.lomin < -180 || b.lomax > 180) return null;
  // limit bbox area to avoid giant queries
  if ((b.lamax - b.lamin) * (b.lomax - b.lomin) > 120 * 120) return 'too-large';
  return b;
}

router.get('/', async (req, res, next) => {
  try {
    const bbox = parseBBox(req.query);
    if (bbox === 'too-large') return res.status(400).json({ error: 'Bounding box too large. Zoom in.' });
    if (bbox && req.query.fresh === '1') await refreshFlights(bbox);
    else { const snap = getFlightsSnapshot(); if (!snap.value) await refreshFlights(bbox); }
    const snap = getFlightsSnapshot();
    const raw = snap.value ? snap.value.states : [];
    const filtered = applyFilters(raw, {
      callsign: req.query.callsign, country: req.query.country,
      minAlt: req.query.minAlt != null ? +req.query.minAlt : null,
      maxAlt: req.query.maxAlt != null ? +req.query.maxAlt : null,
      bbox,
    });
    const st = getStatus();
    res.json({ data: filtered, meta: { updatedAt: snap.updatedAt || st.lastSuccess, stale: snap.stale, provider: 'opensky-network', demo: st.demo || filtered.some(f => f.demo), attribution: 'Flight data: OpenSky Network (https://opensky-network.org). Usage per their terms.' } });
  } catch (e) { next(e); }
});

router.get('/:icao24', async (req, res) => {
  const id = String(req.params.icao24 || '').toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(id)) return res.status(400).json({ error: 'Invalid icao24 (expected 6 hex chars).' });
  const snap = getFlightsSnapshot();
  const found = (snap.value?.states || []).find(a => (a.icao24 || '').toLowerCase() === id);
  if (!found) return res.status(404).json({ error: 'Aircraft not in current snapshot.' });
  res.json({ data: found });
});
module.exports = router;
