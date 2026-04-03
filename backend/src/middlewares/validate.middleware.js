/**
 * validate.middleware.js — Request Body Validators
 *
 * Simple, dependency-free validators.
 * Returns a 400 error immediately if validation fails.
 */

import { createError } from '../utils/error.util.js';

/**
 * Validates the POST /api/chat request body.
 * Rules:
 *  - `message` must be present
 *  - `message` must be a non-empty string
 *  - `message` must not exceed 4000 characters
 */
export function validateChatInput(req, res, next) {
  const { message } = req.body;

  if (message === undefined || message === null) {
    return next(createError('Request body must include a "message" field.', 400));
  }

  if (typeof message !== 'string') {
    return next(createError('"message" must be a string.', 400));
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return next(createError('"message" cannot be empty.', 400));
  }

  if (trimmed.length > 4000) {
    return next(createError('"message" must be 4000 characters or fewer.', 400));
  }

  // Overwrite with trimmed version so controllers don't have to trim
  req.body.message = trimmed;

  next();
}
