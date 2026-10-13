const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('request failed', { path: req.path, message: err.message });
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message, path: req.path });
}
module.exports = errorHandler;
