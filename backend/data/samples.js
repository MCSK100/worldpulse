// Curated fallback data — CLEARLY labeled demo/sample, never presented as live.
const now = () => new Date().toISOString();
module.exports = {
  sampleNews: [
    { title: 'Sample: Global markets steady as central banks signal patience', source: 'World Pulse (sample)', url: 'https://example.com/sample-markets', publishedAt: now(), category: 'Business', summary: 'Example card shown when no news provider is configured.', imageUrl: null, country: null, provider: 'sample', demo: true },
    { title: 'Sample: Space agencies track weekend weather satellite launch', source: 'World Pulse (sample)', url: 'https://example.com/sample-space', publishedAt: now(), category: 'Science', summary: 'Configure GUARDIAN_API_KEY, GNEWS_API_KEY or NEWSAPI_KEY for live headlines.', imageUrl: null, country: null, provider: 'sample', demo: true },
  ],
  sampleFlights: [
    { icao24: 'abc123', callsign: 'DEMO123', lat: 51.47, lon: 0.45, altitude: 35000, velocity: 450, heading: 90, originCountry: 'Demo Country', lastUpdate: now(), demo: true },
    { icao24: 'def456', callsign: 'DEMO456', lat: 40.71, lon: -74.0, altitude: 12000, velocity: 280, heading: 270, originCountry: 'Demo Country', lastUpdate: now(), demo: true },
  ],
  sampleWebcams: [
    { id: 'sample-times-square', title: 'Times Square (example entry)', country: 'United States', city: 'New York', category: 'cities', youtubeId: 'eJ7ZkQ5TC08', pageUrl: 'https://www.youtube.com/results?search_query=times+square+live', status: 'unknown', provider: 'sample', demo: true, lastVerified: now() },
    { id: 'sample-santorini', title: 'Santorini caldera (example entry)', country: 'Greece', city: 'Oia', category: 'landmarks', youtubeId: null, pageUrl: 'https://example.com/cam', status: 'unknown', provider: 'sample', demo: true, lastVerified: now() },
  ],
  sampleStreams: [
    { id: 'nasa-live', title: 'NASA Live — Earth From Space (official)', channel: 'NASA', youtubeId: '21X5lGlDOfg', category: 'Science', language: 'en', country: 'United States', streamUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg', status: 'unknown', provider: 'curated', lastChecked: now() },
    { id: ' sample-africam', title: 'Africam — Wildlife waterhole (example)', channel: 'Africam', youtubeId: 'ydYDqZQpim8', category: 'Nature', language: 'en', country: 'South Africa', streamUrl: 'https://www.youtube.com/watch?v=ydYDqZQpim8', status: 'unknown', provider: 'curated', lastChecked: now() },
  ],
};
