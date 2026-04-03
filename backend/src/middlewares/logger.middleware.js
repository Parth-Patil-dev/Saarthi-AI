/**
 * logger.middleware.js — HTTP Request Logger
 *
 * Logs method, URL, status code, and response time for every request.
 * Coloured output in development for readability.
 */

import { logger } from '../utils/logger.util.js';

export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log AFTER the response is sent so we have the status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const colour = statusCode >= 500
      ? '\x1b[31m'   // Red
      : statusCode >= 400
        ? '\x1b[33m' // Yellow
        : '\x1b[32m'; // Green

    const reset = '\x1b[0m';

    logger.info(
      `${colour}${method}${reset} ${originalUrl} → ${colour}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
}
