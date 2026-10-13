const cache = require('../utils/cache');
const config = require('../config');
const logger = require('../utils/logger');
const { fetchOpenSkyStates } = require('../providers/flightProvider');
const { sampleFlights } = require('../data/samples');

const KEY = 'flights:latest';
const TTL_MS = Math.max(30, config.flightPollSeconds) * 1000;
let inflight = null;
let status = { lastSuccess: null, lastAttempt: null, provider: 'opensky', error: null, demo: true };

function applyFilters(states, { callsign, country, minAlt, maxAlt, bbox } = {}) {
  let out = states;
  if (bbox) out = out.filter(a => a.lat >= bbox.lamin && a.lat <= bbox.lamax && a.lon >= bbox.lomin && a.lon <= bbox.lomax);
  if (callsign) { const q = callsign.trim().toUpperCase(); out = out.filter(a => (a.callsign || '').toUpperCase().includes(q) || (a.icao24 || '').toUpperCase() === q); }
  if (country) out = out.filter(a => (a.originCountry || '').toLowerCase().includes(country.toLowerCase()));
  if (minAlt != null) out = out.filter(a => (a.altitude ?? 0) >= minAlt);
  if (maxAlt != null) out = out.filter(a => (a.altitude ?? 0) <= maxAlt);
  return out.slice(0, 800); // cap markers for perf
}

async function refreshFlights(bbox = null) {
  if (inflight) return inflight; // single shared fetch — never 1 request per user
  status.lastAttempt = new Date().toISOString();
  inflight = (async () => {
    try {
      const { states, time } = await fetchOpenSkyStates(bbox);
      cache.set(KEY, { states, providerTime: time }, TTL_MS);
      status = { lastSuccess: new Date().toISOString(), lastAttempt: status.lastAttempt, provider: 'opensky', error: null, demo: false };
      logger.info('flights refreshed', { count: states.length });
      return { states, demo: false, providerTime: time };
    } catch (e) {
      logger.warn('flights provider failed', { message: e.message });
      status.error = e.message; status.demo = true;
      const stale = cache.getWithStale(KEY);
      if (stale.value && !stale.value.states?.[0]?.demo) return { ...stale.value, stale: true, demo: false };
      return { states: sampleFlights, demo: true, stale: true, providerTime: null };
    } finally { inflight = null; }
  })();
  return inflight;
}

function getFlightsSnapshot() { return cache.getWithStale(KEY); }

module.exports = { refreshFlights, getFlightsSnapshot, applyFilters, getStatus: () => ({ ...status }), TTL_MS };
