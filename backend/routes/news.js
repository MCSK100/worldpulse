const express = require('express');
const { getNews, refreshNews, getStatus } = require('../services/newsService');
const { clampInt } = require('../utils/helpers');
const router = express.Router();

const CATEGORIES = ['World','Politics','Business','Technology','Science','Health','Environment','Sports','Entertainment'];

router.get('/', (req, res) => {
  const { category, country, q, limit } = req.query;
  const r = getNews({ category, country, q, limit: clampInt(limit, 1, 100, 30) });
  res.json({ data: r.articles, meta: { updatedAt: r.updatedAt, stale: r.stale, provider: r.status.provider, demo: r.articles.some(a => a.demo) } });
});
router.get('/breaking', (req, res) => {
  const r = getNews({ limit: 10 });
  res.json({ data: r.articles.slice(0, 10), meta: { updatedAt: r.updatedAt, stale: r.stale } });
});
router.get('/categories', (req, res) => res.json({ data: CATEGORIES }));
router.post('/refresh', async (req, res, next) => {
  try { const r = await refreshNews(); res.json({ data: r.articles, meta: { updatedAt: new Date().toISOString(), fromCache: r.fromCache } }); }
  catch (e) { next(e); }
});
router.get('/status', (req, res) => res.json({ data: getStatus() }));
module.exports = router;
