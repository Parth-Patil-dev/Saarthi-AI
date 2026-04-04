/**
 * pdfText.util.js — Extract text from a PDF file path
 * Used by the grading controller to read answer PDFs.
 */

import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { createError } from './error.util.js';

export async function extractTextFromPdf(filePath) {
  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (err) {
    throw createError(`Could not read PDF: ${err.message}`, 500);
  }

  let parsed;
  try {
    parsed = await pdfParse(buffer);
  } catch (err) {
    throw createError(`PDF parsing failed: ${err.message}`, 422);
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }

  return parsed.text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}
