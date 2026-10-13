const config = require('../config');
const logger = require('../utils/logger');
const { CURATED_CAMS, fetchWindyCams } = require('../providers/webcamProvider');
const { sampleWebcams } = require('../data/samples');

let windyCache = { items: [], updatedAt: null, error: null };

async function refreshWindy() {
  if (!config.keys.windy) { windyCache.error = 'WINDY_API_KEY not configured'; return windyCache; }
  try {
    const items = await fetchWindyCams(config.keys.windy, 30);
    windyCache = { items, updatedAt: new Date().toISOString(), error: null };
  } catch (e) { windyCache.error = e.message; logger.warn('windy refresh failed', { message: e.message }); }
  return windyCache;
}

function listWebcams({ q, category, country } = {}) {
  const now = new Date().toISOString();
  const curated = CURATED_CAMS.map(c => ({ ...c, status: 'unknown', lastVerified: windyCache.updatedAt || now, demo: false, embeddable: !!c.youtubeId }));
  let items = [...windyCache.items.map(w => ({ ...w, embeddable: false })), ...curated];
  if (!config.keys.windy && curated.length === CURATED_CAMS.length) {
    // no provider configured: mark clearly
    items = curated.map(c => ({ ...c, note: 'Curated link-out. Configure WINDY_API_KEY for full directory.' }));
  }
  if (category) items = items.filter(c => (c.category || '').toLowerCase() === category.toLowerCase());
  if (country) items = items.filter(c => (c.country || '').toLowerCase().includes(country.toLowerCase()));
  if (q) { const nq = q.toLowerCase(); items = items.filter(c => `${c.title} ${c.city} ${c.country}`.toLowerCase().includes(nq)); }
  const playable = items.filter(c => c.youtubeId).length;
  return { items: items.slice(0, 100), playable, windy: { updatedAt: windyCache.updatedAt, error: windyCache.error, configured: !!config.keys.windy } };
}

function getWebcam(id) {
  const { items } = listWebcams();
  return items.find(c => c.id === id) || sampleWebcams.find(c => c.id === id) || null;
}

module.exports = { listWebcams, getWebcam, refreshWindy, getWindyCache: () => windyCache };
