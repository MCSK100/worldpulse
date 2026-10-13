const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const http = axios.create({ timeout: 15000 });
let openskyToken = null; let tokenExpiresAt = 0;

async function getOpenSkyToken() {
  if (!config.keys.openskyId || !config.keys.openskySecret) return null;
  if (openskyToken && Date.now() < tokenExpiresAt) return openskyToken;
  const params = new URLSearchParams({ grant_type: 'client_credentials', client_id: config.keys.openskyId, client_secret: config.keys.openskySecret });
  const { data } = await http.post('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token', params);
  openskyToken = data.access_token; tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return openskyToken;
}

function normalizeState(s) {
  // OpenSky states/all vector format
  return {
    icao24: (s[0] || '').trim(),
    callsign: (s[1] || '').trim() || null,
    originCountry: s[2] || null,
    lastUpdate: s[3] ? new Date(s[3] * 1000).toISOString() : null,
    lon: s[5], lat: s[6],
    altitude: s[7] ?? null, // barometric
    velocity: s[9] ?? null,
    heading: s[10] ?? null,
    demo: false,
  };
}

async function fetchOpenSkyStates(bbox = null) {
  const headers = {};
  const token = await getOpenSkyToken().catch(e => { logger.warn('opensky token failed', { message: e.message }); return null; });
  if (token) headers.Authorization = `Bearer ${token}`;
  const params = {};
  if (bbox && bbox.lamin != null) { params.lamin = bbox.lamin; params.lamax = bbox.lamax; params.lomin = bbox.lomin; params.lomax = bbox.lomax; }
  const { data } = await http.get('https://opensky-network.org/api/states/all', { headers, params });
  if (!data || !Array.isArray(data.states)) throw new Error('Invalid OpenSky response');
  return { states: data.states.map(normalizeState).filter(a => a.lat != null && a.lon != null), time: data.time ? new Date(data.time * 1000).toISOString() : new Date().toISOString() };
}

module.exports = { fetchOpenSkyStates, normalizeState };
