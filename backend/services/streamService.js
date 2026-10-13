const config = require('../config');
const { CURATED_STREAMS, verifyYouTubeLive, checkYouTubeExists } = require('../providers/streamProvider');

const liveCache = new Map(); // youtubeId -> { status, checkedAt } (Data API, 5 min)
const existCache = new Map(); // youtubeId -> { status, checkedAt, note } (keyless oEmbed, 60 min)
const LIVE_TTL = 5 * 60 * 1000;
const EXIST_TTL = 60 * 60 * 1000;
const fresh = (entry, ttl) => entry && (Date.now() - new Date(entry.checkedAt).getTime() < ttl);

async function listStreams({ q, category, country } = {}) {
  let items = [...CURATED_STREAMS];
  if (category) items = items.filter(s => (s.category || '').toLowerCase() === category.toLowerCase());
  if (country) items = items.filter(s => (s.country || '').toLowerCase().includes(country.toLowerCase()));
  if (q) { const nq = q.toLowerCase(); items = items.filter(s => `${s.title} ${s.channel}`.toLowerCase().includes(nq)); }
  const out = [];
  for (const s of items) {
    let status = 'unknown';
    let note = 'Open original to confirm live status.';
    let checkedAt = new Date().toISOString();
    if (config.keys.youtube) {
      // Precise live verification via Data API (quota-aware, 5-min cache).
      const cached = liveCache.get(s.youtubeId);
      if (fresh(cached, LIVE_TTL)) { status = cached.status; note = cached.note; checkedAt = cached.checkedAt; }
      else {
        try {
          const v = await verifyYouTubeLive(s.youtubeId, config.keys.youtube);
          liveCache.set(s.youtubeId, v);
          status = v.status; note = v.note || v.title || note; checkedAt = v.checkedAt;
        } catch { /* stay unknown */ }
      }
    } else {
      // Keyless existence check via official oEmbed (hourly cache). Never claims live.
      const cached = existCache.get(s.youtubeId);
      if (fresh(cached, EXIST_TTL)) { status = cached.status; note = cached.note; checkedAt = cached.checkedAt; }
      else {
        const v = await checkYouTubeExists(s.youtubeId);
        existCache.set(s.youtubeId, v);
        status = v.status; note = v.note; checkedAt = v.checkedAt;
      }
    }
    out.push({ ...s, status, note, lastChecked: checkedAt, embedUrl: `https://www.youtube.com/embed/${s.youtubeId}` });
  }
  return { items: out.slice(0, 60), youtubeConfigured: !!config.keys.youtube, keylessChecks: !config.keys.youtube };
}

module.exports = { listStreams };
