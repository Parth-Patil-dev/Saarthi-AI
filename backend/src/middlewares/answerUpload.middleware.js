/**
 * answerUpload.middleware.js — Multer config for answer sheet uploads
 *
 * Accepts:
 *  - Images: jpg, jpeg, png, bmp, tiff, webp  (handwritten scans)
 *  - PDF: application/pdf                      (typed or scanned)
 *
 * Max size: 20MB (larger than PDF upload since images can be big)
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createError } from '../utils/error.util.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'image/webp',
]);

const ALLOWED_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function fileFilter(_req, file, cb) {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_MIMES.has(mime) && ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(createError('Only PDF and image files (jpg, png, bmp, tiff, webp) are accepted.', 415), false);
  }
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const answerUpload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Helper to detect file type from mimetype
export function isImage(mimetype) {
  return mimetype?.startsWith('image/');
}

export function isPdf(mimetype) {
  return mimetype === 'application/pdf';
}
