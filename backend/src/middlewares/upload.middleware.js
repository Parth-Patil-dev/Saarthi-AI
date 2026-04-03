/**
 * upload.middleware.js — Multer File Upload Configuration
 *
 * Handles multipart/form-data uploads.
 * - Accepts PDF files only
 * - Limits file size (configurable via PDF_MAX_SIZE_BYTES in .env)
 * - Stores files temporarily in the uploads/ directory
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createError } from '../utils/error.util.js';

// Ensure the upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Disk Storage ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Prefix with timestamp to avoid name collisions
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

// ── File Filter — PDFs only ───────────────────────────────────────────────────
function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext === '.pdf' && mime === 'application/pdf') {
    cb(null, true); // Accept
  } else {
    cb(createError('Only PDF files are accepted.', 415), false); // Reject
  }
}

// ── Max file size ─────────────────────────────────────────────────────────────
const MAX_SIZE = parseInt(process.env.PDF_MAX_SIZE_BYTES || '10485760', 10); // 10 MB default

// ── Export configured multer instance ─────────────────────────────────────────
export const pdfUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
