/**
 * error.middleware.js — Global Error Handler
 *
 * Express calls this middleware whenever next(err) is called anywhere.
 * It must be registered LAST in server.js (after all routes).
 *
 * Signature must include all 4 parameters for Express to recognise it
 * as an error handler.
 */

import { logger } from '../utils/logger.util.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error in dev; keep it terse in production
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`[Error] ${status} — ${message}`);
    if (err.stack) logger.error(err.stack);
  } else {
    logger.error(`[Error] ${status} — ${message}`);
  }

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      // Include stack trace only in development
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
