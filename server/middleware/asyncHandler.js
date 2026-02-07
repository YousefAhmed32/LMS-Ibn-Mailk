/**
 * Wraps async route handlers so unhandled rejections are passed to next(err).
 * Prevents unhandled promise rejections from crashing the process or leaving responses hanging.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
