const cache = require('../utils/cache');
const config = require('../config');
const logger = require('../utils/logger');
const { dedupeArticles, normalizeText } = require('../utils/helpers');
const { fetchRSSFeed, RSS_FEEDS, fetchGuardian, fetchGNews, fetchNewsAPI } = require('../providers/newsProviders');
const { sampleNews } = require('../data/samples');

const KEY = 'news:latest';
const TTL_MS = 10 * 60 * 1000; // 10-minute cache
let status = { lastSuccess: null, lastAttempt: null, provider: 'none', error: null, backoffUntil: 0, backoffLevel: 0 };

const backoffByProvider = new Map(); // name -> { until, level }
async function withBackoff(name, fn) {
  const b = backoffByProvider.get(name) || { until: 0, level: 0 };
  if (Date.now() < b.until) throw new Error('In backoff cooldown');
  try {
    const r = await fn();
    backoffByProvider.set(name, { until: 0, level: 0 });
    return r;
  } catch (e) {
    const level = Math.min(b.level + 1, 5);
    backoffByProvider.set(name, { until: Date.now() + Math.pow(2, level) * 5000, level });
    throw e;
  }
}

async function refreshNews() {
  status.lastAttempt = new Date().toISOString();
  const errors = [];
  const collected = [];
  // Try configured (keyed) providers first, then the always-on keyless RSS mix.
  const attempts = [];
  if (config.keys.gnews) attempts.push(['gnews', () => fetchGNews(config.keys.gnews)]);
  if (config.keys.newsapi) attempts.push(['newsapi', () => fetchNewsAPI(config.keys.newsapi)]);
  if (config.keys.guardian) attempts.push(['guardian', () => fetchGuardian(config.keys.guardian)]);
  for (const feed of RSS_FEEDS) attempts.push([feed.provider, () => fetchRSSFeed(feed)]);
  const okFeeds = [];
  for (const [name, fn] of attempts) {
    try {
      const arts = await withBackoff(name, fn);
      if (arts && arts.length) { collected.push(...arts); okFeeds.push(name); }
    } catch (e) { errors.push(`${name}: ${e.message}`); logger.warn('news provider failed', { provider: name, message: e.message }); }
  }
  status.provider = okFeeds.length ? [...new Set(okFeeds)].join('+') : status.provider;
  const deduped = dedupeArticles(collected.filter(a => a.title && a.url)).slice(0, 100);
  if (deduped.length) {
    cache.set(KEY, deduped, TTL_MS);
    status.lastSuccess = new Date().toISOString(); status.error = errors.length ? errors.join(' | ') : null;
    logger.info('news refreshed', { count: deduped.length, provider: status.provider });
    return { articles: deduped, fromCache: false };
  }
  status.error = errors.join(' | ') || 'No articles from providers';
  const stale = cache.getWithStale(KEY);
  if (stale.value) return { articles: stale.value, fromCache: true, stale: true };
  cache.set(KEY, sampleNews, 60 * 1000);
  return { articles: sampleNews, fromCache: true, stale: true, demo: true };
}

function getNews({ category, country, q, limit = 30 } = {}) {
  const { value, stale, updatedAt } = cache.getWithStale(KEY);
  let articles = value || [];
  if (category) articles = articles.filter(a => normalizeText(a.category) === normalizeText(category));
  if (q) { const nq = normalizeText(q); articles = articles.filter(a => normalizeText(a.title + ' ' + (a.summary || '')).includes(nq)); }
  if (country) { const nc = normalizeText(country); articles = articles.filter(a => normalizeText(`${a.country || ''} ${a.source || ''}`).includes(nc)); }
  return { articles: articles.slice(0, Math.min(limit, 100)), stale, updatedAt: updatedAt || status.lastSuccess, status };
}

module.exports = { refreshNews, getNews, getStatus: () => ({ ...status }), KEY, TTL_MS };
