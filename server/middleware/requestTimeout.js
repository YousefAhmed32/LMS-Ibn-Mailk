/**
 * Request timeout middleware.
 * Responds with 503 if the handler does not finish within the given ms.
 * Prevents hung requests from holding connections indefinitely.
 */
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 25000;

function requestTimeout(timeoutMs = REQUEST_TIMEOUT_MS) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return;
      clearTimeout(timer);
      res.status(503).json({
        success: false,
        error: 'Request timeout',
        message: 'The server took too long to respond. Please try again.'
      });
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

module.exports = requestTimeout;
