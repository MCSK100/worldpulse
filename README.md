# WORLD PULSE — “The world, happening right now.”

Live global discovery platform: world news (10-min refresh), live flight tracking (OpenSky),
public webcam directory, and public livestream discovery — one dark, dense, readable dashboard.

## Monorepo layout

```
daypulse/
  backend/   Node + Express API (providers, services, jobs, routes, tests)
  frontend/  React + Vite + Tailwind + Leaflet + Framer Motion app
  README.md, TROUBLESHOOTING.md, ACCEPTANCE.md
```

## Quick start (VS Code, 5 minutes)

**1. Backend**
```powershell
cd backend
Copy-Item .env.example .env   # edit keys (optional — works without keys)
npm install
npm test                      # 6 tests, must pass
npm run dev                   # http://localhost:4000/api/health
```

**2. Frontend** (new terminal)
```powershell
cd frontend
Copy-Item .env.example .env   # VITE_API_URL=http://localhost:4000 for prod builds; proxy handles dev
npm install
npm run dev                   # http://localhost:5173
```

Dev proxy: `vite.config.js` forwards `/api/*` → `http://localhost:4000`, so no CORS setup needed locally.

## What works with NO keys (verified live)

| Feature | Status | Source |
|---|---|---|
| News headlines + breaking + categories + search | ✅ LIVE, no key | 5 RSS feeds (BBC World + Tech, Al Jazeera, France 24, NPR), 10-min cron, cross-source dedupe, stale fallback |
| Streams directory (NASA ×2, Al Jazeera EN+AR, NamibiaCam) | ✅ Curated embeds, keyless checks | Every ID oEmbed-verified; hourly existence re-checks; `available` = resolves (open original to confirm live) |
| Webcams directory | ✅ 4 verified entries, no key | NASA TV, EarthCam Times Square, NamibiaCam embeds + Explore.org link-out; full directory needs `WINDY_API_KEY` |
| Flights map + search + detail | ⚠️ LIVE when quota allows | OpenSky anonymous tried first (800 aircraft observed); tight quota → falls back to 2 clearly-labeled sample aircraft |

Proof (13 Oct 2026, zero keys): `GET /api/news?limit=100` → 94 fresh items (`stale:false`, BBC 35 / Al Jazeera 25 / France 24 24 / NPR 10); `GET /api/streams` → 5 × `available`; `GET /api/webcams` → 4 verified entries. Dead entries found during verification (a stale Sky News video ID, a 404 tourism page, an unreachable transport page, a repurposed wildlife ID) were removed or corrected, not shipped.

## API keys (all optional, backend-only — never in frontend)

| Key | Get it | Free tier | Enables |
|---|---|---|---|
| `GUARDIAN_API_KEY` | https://open-platform.theguardian.com/access | Free, 500 req/day, attribution required | Guardian headlines merged with RSS |
| `GNEWS_API_KEY` | https://gnews.io | Free 100 req/day | Top-headlines + images |
| `NEWSAPI_KEY` | https://newsapi.org | Free dev, 100 req/day, non-commercial | Top-headlines |
| `OPENSKY_CLIENT_ID/SECRET` | https://opensky-network.org (OAuth2) | Free, rate-limited; authenticated = higher quota | Real aircraft states instead of demo |
| `WINDY_API_KEY` | https://api.windy.com/webcams | Free tier limited | Full webcam directory + previews |
| `YOUTUBE_API_KEY` | Google Cloud Console → YouTube Data API v3 | Free 10k quota units/day | Verified live/upcoming/ended status |
| `SUPABASE_URL/ANON_KEY` | https://supabase.com | Free tier | Optional cloud saved-items (localStorage works without it) |
| `CRON_SECRET` | any random string | — | Secures `POST /api/cron/news-refresh` for external schedulers |
| `FRONTEND_ORIGIN` | your Vercel URL | — | CORS allowlist |

Copy `backend/.env.example` → `backend/.env` and fill only what you have.

## Backend endpoints

```
GET  /api/health  /api/status  /api/regions
GET  /api/news?category=&country=&q=&limit=  /api/news/breaking  /api/news/categories  POST /api/news/refresh (rate-limited 6/5min)
GET  /api/flights?callsign=&country=&minAlt=&maxAlt=&lamin=&lamax=&lomin=&lomax=  GET /api/flights/:icao24
GET  /api/webcams?q=&category=&country=  GET /api/webcams/:id
GET  /api/streams?q=&category=&country=
POST /api/cron/news-refresh  (header x-cron-secret)
```

Caching: news 10 min, flights 60 s (single shared fetch — never 1 upstream req/user), streams verify 5 min. In-memory cache resets on restart and isn't shared across instances (documented limitation).

## Deployment

**Backend → Render:** New Web Service → root `backend/`, build `npm install`, start `npm start`. Set env vars from `.env.example`. Add cron: Render Cron Job or cron-job.org → `POST https://<api>/api/cron/news-refresh` with header `x-cron-secret`. Do NOT rely on in-process `node-cron` on serverless — the in-process scheduler only runs on the persistent Render instance.

**Frontend → Vercel:** New project → root `frontend/`, build `npm run build`, output `dist`. Set `VITE_API_URL=https://<your-render-api>`. Set backend `FRONTEND_ORIGIN=https://<your-vercel-app>`.

**Supabase (optional):** create table `favorites(user_id uuid, kind text, ref text, created_at timestamptz default now())` with RLS `auth.uid() = user_id`. App works fully without login.

## Tests

```powershell
cd backend; npm test
```
Covers: news normalize/dedupe, OpenSky vector mapping, webcam URL validation, invalid-response handling. See `ACCEPTANCE.md` for the manual per-page checklist and `TROUBLESHOOTING.md` for fixes.
