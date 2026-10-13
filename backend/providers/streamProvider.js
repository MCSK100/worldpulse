const axios = require('axios');

// Curated official public broadcasts. Every entry below was verified resolvable
// via YouTube's keyless oEmbed endpoint on 2026-10-13; the backend re-checks
// hourly and marks anything that stops resolving as unavailable.
// Live status itself is verified only with YOUTUBE_API_KEY; without it we
// honestly report "available" (exists) — never "live".
const CURATED_STREAMS = [
  { id: 'nasa-live', title: 'NASA Live — Official Broadcast', channel: 'NASA', youtubeId: '21X5lGlDOfg', category: 'Science', language: 'en', country: 'United States', streamUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg' },
  { id: 'nasa-media', title: 'NASA Media Channel', channel: 'NASA', youtubeId: 'nA9UZF-SZoQ', category: 'Science', language: 'en', country: 'United States', streamUrl: 'https://www.youtube.com/watch?v=nA9UZF-SZoQ' },
  { id: 'aljazeera-en', title: 'Al Jazeera English — Live', channel: 'Al Jazeera English', youtubeId: 'gCNeDWCI0vo', category: 'News', language: 'en', country: 'Qatar', streamUrl: 'https://www.youtube.com/watch?v=gCNeDWCI0vo' },
  { id: 'aljazeera-ar', title: 'Al Jazeera Arabic — Live', channel: 'Al Jazeera Arabic', youtubeId: 'bNyUyrR0PHo', category: 'News', language: 'ar', country: 'Qatar', streamUrl: 'https://www.youtube.com/watch?v=bNyUyrR0PHo' },
  { id: 'namib-desert-live', title: 'NamibiaCam — Namib Desert Live', channel: 'NamibiaCam', youtubeId: 'ydYDqZQpim8', category: 'Nature', language: 'en', country: 'Namibia', streamUrl: 'https://www.youtube.com/watch?v=ydYDqZQpim8' },
];

// Pure mapper (unit-tested): oEmbed HTTP status -> availability.
function mapOembedStatus(httpStatus) {
  if (httpStatus === 200) return 'available';
  return 'unavailable'; // 401 removed/private, 403 embedding disabled, 404 gone
}

// Keyless existence check via YouTube's official oEmbed endpoint (no key, no quota).
// Returns { status: 'available'|'unavailable'|'unknown', ... } — 'unknown' only
// when the check itself could not run (network error); never claims "live".
async function checkYouTubeExists(youtubeId) {
  try {
    const r = await axios.get('https://www.youtube.com/oembed', {
      params: { url: `https://www.youtube.com/watch?v=${youtubeId}`, format: 'json' },
      timeout: 10000, validateStatus: () => true,
    });
    const status = mapOembedStatus(r.status);
    return {
      status,
      checkedAt: new Date().toISOString(),
      title: r.data && r.data.title ? r.data.title : undefined,
      note: status === 'available'
        ? 'Video exists. Live status unconfirmed — open original to confirm.'
        : 'Video unavailable, private, or embedding disabled.',
    };
  } catch (e) {
    return { status: 'unknown', checkedAt: new Date().toISOString(), note: 'Existence check failed — open original to confirm.' };
  }
}

async function verifyYouTubeLive(youtubeId, apiKey) {
  if (!apiKey) return { status: 'unknown', checkedAt: new Date().toISOString(), note: 'YOUTUBE_API_KEY not configured — open original to confirm live status.' };
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: { id: youtubeId, key: apiKey, part: 'snippet,liveStreamingDetails' }, timeout: 10000,
  });
  const v = (data.items || [])[0];
  if (!v) return { status: 'unavailable', checkedAt: new Date().toISOString(), note: 'Video removed, private, or ended.' };
  const live = v.snippet.liveBroadcastContent; // 'live' | 'upcoming' | 'none'
  return { status: live === 'live' ? 'live' : live === 'upcoming' ? 'upcoming' : 'ended', checkedAt: new Date().toISOString(), title: v.snippet.title };
}

module.exports = { CURATED_STREAMS, verifyYouTubeLive, checkYouTubeExists, mapOembedStatus };
