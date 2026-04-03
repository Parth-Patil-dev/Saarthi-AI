/**
 * notFound.middleware.js — 404 Handler
 *
 * Catches requests that don't match any defined route.
 * Registered AFTER all routes in server.js.
 */

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}
