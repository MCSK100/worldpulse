const express = require('express');
const { listStreams } = require('../services/streamService');
const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    const { q, category, country } = req.query;
    const r = await listStreams({ q, category, country });
    res.json({ data: r.items, meta: { count: r.items.length, youtubeConfigured: r.youtubeConfigured, updatedAt: new Date().toISOString(), note: r.youtubeConfigured ? 'Live status verified via YouTube Data API.' : 'Keyless mode: video existence verified hourly via official oEmbed. "Available" means the video resolves — open original to confirm it is live right now.' } });
  } catch (e) { next(e); }
});
module.exports = router;
