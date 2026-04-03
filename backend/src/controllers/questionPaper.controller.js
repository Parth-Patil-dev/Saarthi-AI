/**
 * questionPaper.controller.js — Question Paper Generator Handlers
 */

import { generateQuestionPaper, getSubjects } from '../services/questionPaper.service.js';
import { createError } from '../utils/error.util.js';

/**
 * GET /api/question-paper/subjects
 * Returns the list of available subjects for the dropdown.
 */
export function fetchSubjects(req, res) {
  const subjects = getSubjects();
  res.status(200).json({ success: true, subjects });
}

/**
 * POST /api/question-paper/generate
 * Body: { subject, chapter, difficulty, totalMarks, numQuestions, includeAnswers }
 * Response: { success, paper: { title, subject, chapter, difficulty, totalMarks, questions[] } }
 */
export async function generatePaper(req, res, next) {
  try {
    const {
      subject,
      chapter,
      difficulty,
      totalMarks,
      numQuestions,
      includeAnswers,
    } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!subject)   return next(createError('"subject" is required.', 400));
    if (!chapter || !chapter.trim())
                    return next(createError('"chapter" is required.', 400));

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!difficulty || !validDifficulties.includes(difficulty.toLowerCase()))
      return next(createError(`"difficulty" must be one of: ${validDifficulties.join(', ')}.`, 400));

    const marks = parseInt(totalMarks, 10);
    if (isNaN(marks) || marks < 1 || marks > 200)
      return next(createError('"totalMarks" must be a number between 1 and 200.', 400));

    const count = parseInt(numQuestions, 10);
    if (isNaN(count) || count < 1 || count > 50)
      return next(createError('"numQuestions" must be a number between 1 and 50.', 400));

    // ── Generate ────────────────────────────────────────────────────────────
    const paper = await generateQuestionPaper({
      subject:        subject.trim(),
      chapter:        chapter.trim(),
      difficulty:     difficulty.toLowerCase(),
      totalMarks:     marks,
      numQuestions:   count,
      includeAnswers: Boolean(includeAnswers),
    });

    res.status(200).json({ success: true, paper });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
