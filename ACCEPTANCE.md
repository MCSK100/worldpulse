# Manual acceptance checklist

## Dashboard (`/`)
- [ ] 4 stat cards show real values (news timestamp, aircraft count, cameras playable, streams count)
- [ ] No LIVE dot unless source actually updating (news fresh, flights non-demo)
- [ ] Breaking list shows publisher + UTC time + category + working “Read original article”
- [ ] Map renders, layer toggles hide/show, marker click opens popup
- [ ] Mobile: cards stack, header collapses to menu

## News (`/news`)
- [ ] Filter + category select update list (debounced), empty query shows no-results state
- [ ] `Source / Updated / STALE` stamp visible; stale shows amber badge

## Flights (`/flights`)
- [ ] Map + searchable list; DEMO banner only when provider unavailable
- [ ] Click aircraft → panel with callsign/icao24/pos/alt/speed/heading/country/updated
- [ ] Invalid icao24 (`/api/flights/zzz`) → 400; unknown id → 404

## Cameras (`/cameras`)
- [ ] Search filters; “Open player” embeds YouTube or shows link-out fallback
- [ ] “Original page” always present; no private/CCTV content

## Streams (`/streams`)
- [ ] Status badges honest (UNKNOWN without key, never fake LIVE)
- [ ] Embed blocked → “Open original” works

## Map (`/map`), Search (`/search`), Settings (`/settings`)
- [ ] Region select refocuses map; tabs switch result types; saved articles persist in localStorage
- [ ] Theme toggle persists; reduced-motion respected; all inputs labeled
