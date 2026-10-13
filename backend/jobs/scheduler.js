const cron = require('node-cron');
const config = require('../config');
const logger = require('../utils/logger');
const { refreshNews } = require('../services/newsService');
const { refreshWindy } = require('../services/webcamService');

function startJobs() {
  const expr = config.newsRefreshCron;
  if (cron.validate(expr)) {
    cron.schedule(expr, async () => {
      logger.info('cron: news refresh tick');
      try { await refreshNews(); } catch (e) { logger.error('cron news failed', { message: e.message }); }
    });
    logger.info('news cron scheduled', { expr });
  } else logger.warn('invalid NEWS_REFRESH_CRON, skipping', { expr });
  // Camera health check hourly (light — does not poll third parties aggressively)
  cron.schedule('17 * * * *', async () => {
    logger.info('cron: camera health tick');
    try { await refreshWindy(); } catch (e) { logger.error('cron cams failed', { message: e.message }); }
  });
  // Initial warm-up (non-blocking)
  refreshNews().catch(e => logger.warn('initial news warm-up failed', { message: e.message }));
  refreshWindy().catch(() => {});
}
module.exports = { startJobs };
