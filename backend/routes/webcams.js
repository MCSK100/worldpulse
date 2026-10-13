const express = require('express');
const { listWebcams, getWebcam } = require('../services/webcamService');
const router = express.Router();
router.get('/', (req, res) => {
  const { q, category, country } = req.query;
  const r = listWebcams({ q, category, country });
  res.json({ data: r.items, meta: { playable: r.playable, count: r.items.length, windy: r.windy, updatedAt: new Date().toISOString() } });
});
router.get('/:id', (req, res) => {
  const cam = getWebcam(req.params.id);
  if (!cam) return res.status(404).json({ error: 'Camera not found.' });
  res.json({ data: cam });
});
module.exports = router;
