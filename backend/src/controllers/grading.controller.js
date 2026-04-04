/**
 * grading.controller.js — Answer Submission & Stats Handlers
 */

import {
  gradeSubmission,
  getResult,
  getAdviceForResult,
  getStudentResults,
  getAllResults,
  getStudentStats,
  getAllStats,
} from '../services/grading.service.js';
import { extractTextFromImage } from '../utils/ocr.util.js';
import { extractTextFromPdf }   from '../utils/pdfText.util.js';
import { isImage, isPdf }       from '../middlewares/answerUpload.middleware.js';
import { createError }          from '../utils/error.util.js';
import { logger }               from '../utils/logger.util.js';

/**
 * POST /api/grading/submit
 *
 * Accepts multipart/form-data:
 *   - paperId       (required)
 *   - studentId     (required)
 *   - studentName   (optional)
 *   - answers       (JSON string: [{questionNumber, answerText}], optional if file provided)
 *   - file          (image or PDF of handwritten/typed answers, optional)
 */
export async function submitAnswers(req, res, next) {
  try {
    let { paperId, studentId, studentName, answers } = req.body;

    if (!paperId)   return next(createError('"paperId" is required.', 400));
    if (!studentId) return next(createError('"studentId" is required.', 400));

    // Parse answers if sent as JSON string (common in multipart forms)
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch {
        return next(createError('"answers" must be a valid JSON array.', 400));
      }
    }
    answers = answers || [];

    // Extract text from uploaded file (image or PDF)
    if (req.file) {
      let extractedText = '';

      if (isImage(req.file.mimetype)) {
        logger.info(`[Grading] Running OCR on image: ${req.file.originalname}`);
        extractedText = await extractTextFromImage(req.file.path);
      } else if (isPdf(req.file.mimetype)) {
        logger.info(`[Grading] Extracting text from PDF: ${req.file.originalname}`);
        extractedText = await extractTextFromPdf(req.file.path);
      }

      if (extractedText) {
        if (answers.length === 0) {
          // No structured answers — treat entire extracted text as answers
          answers = [{ questionNumber: 0, answerText: extractedText }];
        } else {
          // Append extracted text as extra context to each answer
          answers = answers.map(a => ({
            ...a,
            answerText: a.answerText
              ? `${a.answerText}\n[From uploaded file]: ${extractedText}`
              : extractedText,
          }));
        }
      }
    }

    if (answers.length === 0) {
      return next(createError('Provide either "answers" array or upload an answer sheet file.', 400));
    }

    const result = await gradeSubmission({ paperId, studentId, studentName, answers });
    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results?subject=&chapter=&search=&studentId=
export async function listResults(req, res, next) {
  try {
    const { subject, chapter, search, studentId } = req.query;
    const results = await getAllResults({ subject, chapter, search, studentId });
    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results/:resultId
export async function fetchResult(req, res, next) {
  try {
    const result = await getResult(req.params.resultId);
    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results/:resultId/advice — lazy-generate + cache advice
export async function fetchAdvice(req, res, next) {
  try {
    const advice = await getAdviceForResult(req.params.resultId);
    res.status(200).json({ success: true, advice });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results/student/:studentId
export async function fetchStudentResults(req, res, next) {
  try {
    const results = await getStudentResults(req.params.studentId);
    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/stats
export async function listStats(req, res, next) {
  try {
    const stats = await getAllStats();
    res.status(200).json({ success: true, count: stats.length, stats });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/stats/:studentId
export async function fetchStudentStats(req, res, next) {
  try {
    const stats = await getStudentStats(req.params.studentId);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
