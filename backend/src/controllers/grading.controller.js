/**
 * grading.controller.js — Answer Submission & Stats Handlers
 */

import {
  gradeSubmission,
  getResult,
  getStudentResults,
  getAllResults,
  getStudentStats,
  getAllStats,
} from '../services/grading.service.js';
import { extractTextFromPdf } from '../utils/pdfText.util.js';
import { createError } from '../utils/error.util.js';

/**
 * POST /api/grading/submit
 * Body (JSON): { paperId, studentId, studentName?, answers: [{questionNumber, answerText}] }
 * Body (multipart): same fields + optional file (PDF of answers)
 */
export async function submitAnswers(req, res, next) {
  try {
    let { paperId, studentId, studentName, answers } = req.body;

    // If answers came as a JSON string (from multipart form), parse it
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch {
        return next(createError('"answers" must be a valid JSON array.', 400));
      }
    }

    // If a PDF was uploaded, extract text and treat as one big answer block
    if (req.file) {
      const extracted = await extractTextFromPdf(req.file.path);
      // Merge extracted text into answers — prepend as a general answer if no structured answers
      if (!answers || answers.length === 0) {
        answers = [{ questionNumber: 0, answerText: extracted }];
      } else {
        // Append the full PDF text as context for the AI grader
        answers = answers.map(a => ({
          ...a,
          answerText: a.answerText
            ? `${a.answerText}\n[PDF context]: ${extracted}`
            : extracted,
        }));
      }
    }

    if (!paperId)    return next(createError('"paperId" is required.', 400));
    if (!studentId)  return next(createError('"studentId" is required.', 400));
    if (!answers || !Array.isArray(answers) || answers.length === 0)
      return next(createError('"answers" must be a non-empty array.', 400));

    const result = await gradeSubmission({ paperId, studentId, studentName, answers });

    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results — all results
export async function listResults(req, res, next) {
  try {
    const results = await getAllResults();
    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results/:resultId — single result
export async function fetchResult(req, res, next) {
  try {
    const result = await getResult(req.params.resultId);
    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/results/student/:studentId — all results for a student
export async function fetchStudentResults(req, res, next) {
  try {
    const results = await getStudentResults(req.params.studentId);
    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/stats — all students stats
export async function listStats(req, res, next) {
  try {
    const stats = await getAllStats();
    res.status(200).json({ success: true, count: stats.length, stats });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/grading/stats/:studentId — one student's stats
export async function fetchStudentStats(req, res, next) {
  try {
    const stats = await getStudentStats(req.params.studentId);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
