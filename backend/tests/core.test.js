const test = require('node:test');
const assert = require('node:assert');
const { dedupeArticles, canonicalUrl, isValidHttpUrl } = require('../utils/helpers');
const { normalizeNewsArticle, RSS_FEEDS } = require('../providers/newsProviders');
const { mapOembedStatus } = require('../providers/streamProvider');
const { normalizeState } = require('../providers/flightProvider');
const { validateWebcamUrl } = require('../providers/webcamProvider');

test('dedupe removes same URL + headline variants', () => {
  const arts = [
    { title: 'Hello World!', url: 'https://x.com/a?utm_source=1' },
    { title: 'hello   world', url: 'https://x.com/a' },
    { title: 'Other', url: 'https://x.com/b' },
  ];
  assert.strictEqual(dedupeArticles(arts).length, 2);
});
test('canonicalUrl strips tracking params', () => {
  assert.ok(!canonicalUrl('https://x.com/a?utm_source=1').includes('utm_source'));
});
test('normalizeNewsArticle caps lengths', () => {
  const a = normalizeNewsArticle({ title: 't'.repeat(500), url: 'https://x.com', summary: 's'.repeat(900) });
  assert.ok(a.title.length <= 220 && a.summary.length <= 400);
});
test('normalizeState maps opensky vector', () => {
  const s = normalizeState(['abc123', 'DLH123 ', 'Germany', 1700000000, 100, -73.9, 40.7, 10000, false, 250, 90]);
  assert.strictEqual(s.icao24, 'abc123'); assert.strictEqual(s.lat, 40.7);
});
test('webcam URL validation rejects rtmp + bad urls', () => {
  assert.strictEqual(validateWebcamUrl('rtmp://evil/x'), false);
  assert.strictEqual(validateWebcamUrl('https://example.com/cam'), true);
  assert.strictEqual(validateWebcamUrl('not a url'), false);
});
test('invalid API responses handled', () => {
  assert.strictEqual(isValidHttpUrl(''), false);
});
test('keyless RSS feed list has multiple reputable sources', () => {
  assert.ok(RSS_FEEDS.length >= 4, 'expected 4+ keyless feeds');
  for (const f of RSS_FEEDS) {
    assert.ok(/^https:\/\//.test(f.url), `feed URL must be https: ${f.provider}`);
    assert.ok(f.source && f.category && f.provider, 'feed needs source/category/provider');
  }
  const providers = new Set(RSS_FEEDS.map(f => f.provider));
  assert.ok(providers.size >= 3, 'expected 3+ distinct providers for cross-source dedupe');
});
test('dedupe merges overlapping stories across sources', () => {
  const arts = [
    { title: 'Gaza aid deal reached', url: 'https://bbc.co.uk/news/a' },
    { title: 'Gaza aid deal reached', url: 'https://aljazeera.com/news/a' }, // different outlet, same story
    { title: 'Gaza aid deal reached', url: 'https://bbc.co.uk/news/a?utm_source=rss' }, // same, tracked URL
    { title: 'Markets rally on rate news', url: 'https://npr.org/x' },
  ];
  const out = dedupeArticles(arts);
  assert.strictEqual(out.length, 2);
});
test('mapOembedStatus never claims live', () => {
  assert.strictEqual(mapOembedStatus(200), 'available');
  for (const code of [401, 403, 404, 500]) assert.strictEqual(mapOembedStatus(code), 'unavailable');
});
