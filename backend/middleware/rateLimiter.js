const rateLimit = require('express-rate-limit');

const general = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const manualRefresh = rateLimit({
  windowMs: 5 * 60 * 1000, max: 6,
  message: { error: 'Manual refresh rate limit exceeded. Try again in a few minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

module.exports = { general, manualRefresh };
