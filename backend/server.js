const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const { general, manualRefresh } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { startJobs } = require('./jobs/scheduler');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.frontendOrigin, credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny'));
app.use('/api/', general);

app.get('/api/health', (req, res) => res.json({ ok: true, utc: new Date().toISOString(), version: '1.0.0' }));
app.use('/api/news', require('./routes/news'));
app.post('/api/news/refresh', manualRefresh);
app.use('/api/flights', require('./routes/flights'));
app.use('/api/webcams', require('./routes/webcams'));
app.use('/api/streams', require('./routes/streams'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/status', require('./routes/status'));

// Secured cron trigger for serverless/external schedulers
app.post('/api/cron/news-refresh', async (req, res) => {
  if (!config.cronSecret || req.headers['x-cron-secret'] !== config.cronSecret)
    return res.status(401).json({ error: 'Unauthorized' });
  const { refreshNews } = require('./services/newsService');
  const r = await refreshNews();
  res.json({ ok: true, count: r.articles.length });
});

app.use('/api/', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const port = config.port;
if (require.main === module) {
  app.listen(port, () => { logger.info(`WORLD PULSE backend listening on :${port}`); startJobs(); });
} else { startJobs(); }
module.exports = app;
