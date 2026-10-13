const axios = require('axios');
const { dedupeArticles } = require('../utils/helpers');
const logger = require('../utils/logger');

const http = axios.create({ timeout: 12000, headers: { 'User-Agent': 'WorldPulse/1.0 (+news aggregator)' } });

// --- Normalizer: every provider maps to this shape ---
function normalizeNewsArticle(a) {
  return {
    title: String(a.title || '').slice(0, 220),
    source: String(a.source || 'Unknown'),
    url: String(a.url || ''),
    publishedAt: a.publishedAt || null,
    category: a.category || 'World',
    summary: String(a.summary || '').slice(0, 400),
    imageUrl: a.imageUrl || null,
    country: a.country || null,
    provider: a.provider || 'unknown',
    demo: !!a.demo,
  };
}

// --- Keyless RSS aggregator: reputable public feeds, no signup, no key. ---
// These publishers offer RSS for aggregation; we link + summarize, never republish.
const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'World', provider: 'bbc-rss', limit: 25 },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC News', category: 'Technology', provider: 'bbc-rss', limit: 10 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'World', provider: 'aljazeera-rss', limit: 25 },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', category: 'World', provider: 'france24-rss', limit: 25 },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR', category: 'World', provider: 'npr-rss', limit: 15 },
];

function pickTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}
function pickLink(block) {
  const inline = pickTag(block, 'link');
  if (inline && /^https?:\/\//i.test(inline)) return inline;
  const href = block.match(/<link[^>]*href="([^"]+)"/);
  if (href) return href[1];
  return pickTag(block, 'guid');
}
function pickImage(block) {
  const m = block.match(/<(?:media:content|enclosure)[^>]*url="([^"]+)"/);
  return m ? m[1] : null;
}
function pickDate(block) {
  const raw = pickTag(block, 'pubDate') || pickTag(block, 'updated') || pickTag(block, 'dc:date');
  if (!raw) return null;
  const t = new Date(raw);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

async function fetchRSSFeed(feed, limit = null) {
  const { data: xml } = await http.get(feed.url, { responseType: 'text' });
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]).slice(0, limit || feed.limit || 20);
  return items.map(block => normalizeNewsArticle({
    title: pickTag(block, 'title'),
    source: feed.source,
    url: pickLink(block),
    publishedAt: pickDate(block),
    category: feed.category,
    summary: (pickTag(block, 'description') || '').replace(/<[^>]+>/g, '').slice(0, 300),
    imageUrl: pickImage(block),
    provider: feed.provider,
  })).filter(a => a.title && a.url && /^https?:\/\//i.test(a.url));
}

// Backwards-compatible wrapper (BBC World baseline).
function fetchBBCWorldRSS(limit = 30) {
  return fetchRSSFeed(RSS_FEEDS[0], limit);
}

async function fetchGuardian(apiKey, query = 'world', limit = 20) {
  if (!apiKey) throw Object.assign(new Error('Guardian key not configured'), { status: 501 });
  const { data } = await http.get('https://content.guardianapis.com/search', {
    params: { 'api-key': apiKey, q: query, 'page-size': limit, 'show-fields': 'thumbnail,trailText', 'order-by': 'newest' },
  });
  return (data.response.results || []).map(r => normalizeNewsArticle({
    title: r.webTitle, source: 'The Guardian', url: r.webUrl,
    publishedAt: r.webPublicationDate || null, category: 'World',
    summary: (r.fields && r.fields.trailText || '').replace(/<[^>]+>/g, ''),
    imageUrl: (r.fields && r.fields.thumbnail) || null, provider: 'guardian',
  }));
}

async function fetchGNews(apiKey, limit = 20) {
  if (!apiKey) throw Object.assign(new Error('GNews key not configured'), { status: 501 });
  const { data } = await http.get('https://gnews.io/api/v4/top-headlines', {
    params: { apikey: apiKey, lang: 'en', max: limit },
  });
  const cat = (t) => /tech/i.test(t) ? 'Technology' : /sport/i.test(t) ? 'Sports' : /business|market/i.test(t) ? 'Business' : 'World';
  return (data.articles || []).map(a => normalizeNewsArticle({
    title: a.title, source: (a.source && a.source.name) || 'GNews', url: a.url,
    publishedAt: a.publishedAt || null, category: cat(a.title || ''),
    summary: a.description || '', imageUrl: a.image || null, provider: 'gnews',
  }));
}

async function fetchNewsAPI(apiKey, limit = 20) {
  if (!apiKey) throw Object.assign(new Error('NewsAPI key not configured'), { status: 501 });
  const { data } = await http.get('https://newsapi.org/v2/top-headlines', {
    params: { apiKey, language: 'en', pageSize: limit },
  });
  return (data.articles || []).map(a => normalizeNewsArticle({
    title: a.title, source: (a.source && a.source.name) || 'NewsAPI', url: a.url,
    publishedAt: a.publishedAt || null, category: 'World', summary: a.description || '',
    imageUrl: a.urlToImage || null, provider: 'newsapi',
  }));
}

module.exports = { normalizeNewsArticle, fetchRSSFeed, RSS_FEEDS, fetchBBCWorldRSS, fetchGuardian, fetchGNews, fetchNewsAPI, dedupeArticles, logger };
