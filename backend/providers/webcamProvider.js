const axios = require('axios');
const { isValidHttpUrl } = require('../utils/helpers');

// Curated public cameras — keyless directory. Every entry verified 2026-10-13:
// YouTube IDs resolve via official oEmbed; page URLs returned HTTP 200.
// Only link/embed where the provider permits embedding; otherwise link-out.
// Unverifiable entries (dead pages, bot-walled sites) were removed, not listed.
const CURATED_CAMS = [
  { id: 'nasa-tv', title: 'NASA TV — Official Live Stream', country: 'International', city: 'Low Earth Orbit', category: 'nature', youtubeId: '21X5lGlDOfg', pageUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg', provider: 'youtube-official' },
  { id: 'times-square-4k', title: 'EarthCam: Times Square in 4K', country: 'United States', city: 'New York', category: 'cities', youtubeId: 'eJ7ZkQ5TC08', pageUrl: 'https://www.youtube.com/watch?v=eJ7ZkQ5TC08', provider: 'youtube-official' },
  { id: 'namib-desert', title: 'NamibiaCam — Namib Desert Live', country: 'Namibia', city: 'Namib Desert', category: 'wildlife', youtubeId: 'ydYDqZQpim8', pageUrl: 'https://www.youtube.com/watch?v=ydYDqZQpim8', provider: 'youtube-official' },
  { id: 'explore-wildlife', title: 'Explore.org — Wildlife Live Cams', country: 'Various', city: null, category: 'wildlife', youtubeId: null, pageUrl: 'https://explore.org/livecams', provider: 'official-directory' },
];

function validateWebcamUrl(u) {
  if (!u) return false;
  if (!isValidHttpUrl(u)) return false;
  if (/^(rtmp|rtsp):/i.test(u)) return false; // never expose raw stream URLs
  return true;
}

async function fetchWindyCams(apiKey, limit = 20) {
  if (!apiKey) throw Object.assign(new Error('Windy key not configured'), { status: 501 });
  const { data } = await axios.get('https://api.windy.com/webcams/api/v3/webcams/list', {
    headers: { 'x-windy-api-key': apiKey }, params: { limit, offset: 0 }, timeout: 12000,
  });
  return (data.webcams || []).map(w => ({
    id: String(w.webcamId), title: w.title, country: w.location?.country || null,
    city: w.location?.city || null, category: (w.category?.[0]?.name || 'cities').toLowerCase(),
    previewUrl: w.images?.current?.preview || null,
    pageUrl: w.urls?.detail || null, status: 'unknown', provider: 'windy',
    lastVerified: new Date().toISOString(), demo: false,
  }));
}

module.exports = { CURATED_CAMS, validateWebcamUrl, fetchWindyCams };
