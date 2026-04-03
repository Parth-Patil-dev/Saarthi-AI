/**
 * error.util.js — Error Factory
 *
 * Creates a standard Error object with an HTTP status code attached.
 * Using this everywhere means the global error handler always has
 * the right status code to send back to the client.
 *
 * Usage:
 *   throw createError('Not found', 404);
 *   next(createError('Invalid input', 400));
 */

/**
 * @param {string} message  - Human-readable error message
 * @param {number} status   - HTTP status code (default 500)
 * @returns {Error}
 */
export function createError(message, status = 500) {
  const err = new Error(message);
  err.status = status;
  return err;
}
