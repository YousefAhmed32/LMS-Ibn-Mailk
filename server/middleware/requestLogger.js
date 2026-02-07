/**
 * Non-blocking request logger. Only logs in development or when LOG_REQUESTS=1.
 * Avoids JSON.stringify(req.body) in production to prevent blocking and PII leakage.
 */
const isDev = process.env.NODE_ENV !== 'production';
const logRequests = process.env.LOG_REQUESTS === '1';

function requestLogger() {
  return (req, res, next) => {
    if (!isDev && !logRequests) {
      return next();
    }
    const method = req.method;
    const url = req.originalUrl || req.url;
    setImmediate(() => {
      const meta = { ip: req.ip };
      if (isDev) {
        meta.ua = req.get('user-agent')?.substring(0, 50);
      }
      console.log(`📨 ${method} ${url}`, meta);
    });
    next();
  };
}

module.exports = requestLogger;
