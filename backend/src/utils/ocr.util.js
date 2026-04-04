/**
 * ocr.util.js — Extract text from images using Tesseract.js
 *
 * Works fully offline — no API key needed.
 * Supports: jpg, jpeg, png, bmp, tiff, webp
 *
 * Install: npm install tesseract.js
 * No system binary needed — tesseract.js is pure JS.
 */

import Tesseract from 'tesseract.js';
import { logger } from './logger.util.js';
import { createError } from './error.util.js';

/**
 * Extract text from an image file.
 * @param {string} imagePath - Absolute path to the image file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imagePath) {
  logger.info(`[OCR] Processing image: ${imagePath}`);

  try {
    const { data } = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.info(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = data.text?.trim();

    if (!text) {
      throw createError(
        'Could not extract any text from the image. ' +
        'Make sure the image is clear and contains readable text.',
        422
      );
    }

    logger.info(`[OCR] Extracted ${text.length} characters from image`);
    return text;
  } catch (err) {
    if (err.status) throw err; // already a createError
    throw createError(`OCR failed: ${err.message}`, 500);
  }
}
