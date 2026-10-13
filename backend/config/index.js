require('dotenv').config();

function num(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

module.exports = {
  port: num('PORT', 4000),
  frontendOrigin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean),
  cronSecret: process.env.CRON_SECRET || '',
  newsRefreshCron: process.env.NEWS_REFRESH_CRON || '*/10 * * * *',
  flightPollSeconds: num('FLIGHT_POLL_SECONDS', 60),
  keys: {
    guardian: process.env.GUARDIAN_API_KEY || '',
    gnews: process.env.GNEWS_API_KEY || '',
    newsapi: process.env.NEWSAPI_KEY || '',
    openskyId: process.env.OPENSKY_CLIENT_ID || '',
    openskySecret: process.env.OPENSKY_CLIENT_SECRET || '',
    windy: process.env.WINDY_API_KEY || '',
    youtube: process.env.YOUTUBE_API_KEY || '',
  },
};
