/**
 * pdf.routes.js — PDF Upload & Management Routes
 */

import { Router } from 'express';
import { uploadPdf, getPdfStatus, clearPdf } from '../controllers/pdf.controller.js';
import { pdfUpload } from '../middlewares/upload.middleware.js';

export const pdfRouter = Router();

// POST /api/upload — Upload a PDF file; extract and store its text
pdfRouter.post('/upload', pdfUpload.single('file'), uploadPdf);

// GET /api/pdf/status — Check if a PDF is loaded and see a snippet
pdfRouter.get('/pdf/status', getPdfStatus);

// DELETE /api/pdf — Remove the stored PDF context from memory
pdfRouter.delete('/pdf', clearPdf);
