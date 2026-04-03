/**
 * pdf.service.js — PDF Parsing & Persistent Storage
 */

import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { logger } from '../utils/logger.util.js';
import { createError } from '../utils/error.util.js';
import { savePdfContext, loadPdfContext, deletePdfContext, initStore } from '../utils/store.util.js';

// In-memory cache of the current PDF context
let pdfContext = null;

// ── Startup ───────────────────────────────────────────────────────────────────

/**
 * Load any previously saved PDF context from disk on startup.
 */
export async function initPdfService() {
  await initStore();
  const saved = await loadPdfContext();
  if (saved) {
    pdfContext = saved;
    logger.info(`[PDF Service] Restored PDF context: "${saved.filename}" (${saved.charCount} chars)`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function parsePdf(filePath, filename) {
  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (err) {
    throw createError(`Could not read uploaded file: ${err.message}`, 500);
  }

  let parsed;
  try {
    parsed = await pdfParse(buffer);
  } catch (err) {
    throw createError(`PDF parsing failed: ${err.message}`, 422);
  } finally {
    await fs.unlink(filePath).catch(() =>
      logger.warn(`[PDF Service] Could not delete temp file: ${filePath}`)
    );
  }

  const text = cleanText(parsed.text);

  if (!text.trim()) {
    throw createError(
      'The PDF appears empty or image-only (scanned). Only text-based PDFs are supported.',
      422
    );
  }

  pdfContext = {
    filename,
    text,
    charCount:  text.length,
    pageCount:  parsed.numpages,
    uploadedAt: new Date().toISOString(),
  };

  // Persist to disk so it survives server restarts
  await savePdfContext(pdfContext);

  logger.info(`[PDF Service] Saved "${filename}" — ${parsed.numpages} pages, ${text.length} chars`);

  return pdfContext;
}

export function getPdfContext() {
  return pdfContext;
}

export async function clearPdfContext() {
  pdfContext = null;
  await deletePdfContext();
  logger.info('[PDF Service] PDF context cleared.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanText(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
