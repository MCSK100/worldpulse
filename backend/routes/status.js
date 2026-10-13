const express = require('express');
const config = require('../config');
const newsSvc = require('../services/newsService');
const flightSvc = require('../services/flightService');
const webcamSvc = require('../services/webcamService');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    data: {
      utc: new Date().toISOString(),
      news: newsSvc.getStatus(),
      flights: flightSvc.getStatus(),
      webcams: webcamSvc.getWindyCache(),
      providersConfigured: {
        guardian: !!config.keys.guardian, gnews: !!config.keys.gnews,
        newsapi: !!config.keys.newsapi, windy: !!config.keys.windy,
        youtube: !!config.keys.youtube, opensky: !!(config.keys.openskyId && config.keys.openskySecret),
      },
    },
  });
});
module.exports = router;
