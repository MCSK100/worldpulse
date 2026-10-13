# Troubleshooting

## Backend won't start
- `PORT in use` → change `PORT=` in `backend/.env`.
- `CORS blocked` → add your Vercel URL to `FRONTEND_ORIGIN` (comma-separated allowed).

## News shows STALE or SAMPLE
- No keys configured → BBC RSS is the baseline; if BBC is unreachable you get 2 labeled samples. Check `GET /api/news/status` error field and server logs.
- `In backoff cooldown` → transient failures trigger exponential backoff (5s→160s). Wait or restart.

## Flights stuck in DEMO
- OpenSky anonymous access is heavily rate-limited and now prefers OAuth. Add `OPENSKY_CLIENT_ID/SECRET`. Demo aircraft (`DEMO123/456`) are always labeled and never claimed live.

## Webcams only show 4 entries
- Normal without `WINDY_API_KEY`. Curated entries are link-outs + permitted YouTube embeds only.

## Streams all say UNKNOWN
- Normal without `YOUTUBE_API_KEY`. Open the original to confirm; verification respects quota (5-min cache per video).

## Frontend blank map
- Leaflet CSS loads from unpkg in `index.html`; needs internet. Check console for `VITE_API_URL` — dev uses proxy, prod builds need the env var at build time.

## Tests fail on Windows
- Run `npm test` from `backend/` (script targets `tests/core.test.js`; bare `tests/` dir form fails on Node 22 Windows).
