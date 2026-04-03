/**
 * pdf.controller.js — PDF Upload Request Handlers
 */

import { parsePdf, getPdfContext, clearPdfContext } from '../services/pdf.service.js';
import { createError } from '../utils/error.util.js';
import { logger } from '../utils/logger.util.js';

/**
 * POST /api/upload
 * multipart/form-data: file (PDF only)
 * Response: { success, message, charCount, preview }
 */
export async function uploadPdf(req, res, next) {
  try {
    // multer places the file info on req.file
    if (!req.file) {
      return next(createError('No file provided. Send a PDF under the "file" field.', 400));
    }

    logger.info(`PDF upload received: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await parsePdf(req.file.path, req.file.originalname);

    res.status(200).json({
      success: true,
      message: 'PDF uploaded and parsed successfully.',
      filename: req.file.originalname,
      charCount: result.charCount,
      pageCount: result.pageCount,
      // Send first 300 chars as a preview so the caller knows it worked
      preview: result.text.slice(0, 300) + (result.text.length > 300 ? '…' : ''),
    });
  } catch (err) {
    next(createError(err.message || 'PDF parsing failed', err.status || 500));
  }
}

/**
 * GET /api/pdf/status
 * Returns whether a PDF is loaded + a snippet.
 */
export function getPdfStatus(req, res) {
  const ctx = getPdfContext();

  if (!ctx) {
    return res.status(200).json({ loaded: false, message: 'No PDF loaded.' });
  }

  res.status(200).json({
    loaded: true,
    filename: ctx.filename,
    charCount: ctx.charCount,
    pageCount: ctx.pageCount,
    preview: ctx.text.slice(0, 300) + (ctx.text.length > 300 ? '…' : ''),
  });
}

/**
 * DELETE /api/pdf
 * Clears the stored PDF context.
 */
export function clearPdf(req, res) {
  clearPdfContext();
  res.status(200).json({ success: true, message: 'PDF context cleared.' });
}
