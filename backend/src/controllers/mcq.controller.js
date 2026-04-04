import { generateMCQ } from '../services/mcq.service.js';
import { gradeSubmission } from '../services/grading.service.js';
import { savePaper } from '../services/grading.service.js';
import { createError } from '../utils/error.util.js';

const DIFFICULTY_CONFIG = {
  easy:   { questions: 5,  timePerQ: 3 },
  medium: { questions: 8,  timePerQ: 2 },
  hard:   { questions: 10, timePerQ: 1 },
};

// POST /api/mcq/generate
export async function generateMCQHandler(req, res, next) {
  try {
    const { subject, chapter, difficulty = 'medium' } = req.body;

    if (!subject?.trim()) return next(createError('"subject" is required.', 400));
    if (!chapter?.trim()) return next(createError('"chapter" is required.', 400));

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty))
      return next(createError(`"difficulty" must be one of: ${validDifficulties.join(', ')}.`, 400));

    const cfg       = DIFFICULTY_CONFIG[difficulty];
    const questions = await generateMCQ({ subject, chapter, difficulty, count: cfg.questions });

    // Build a paper object and save it so grading can reference it
    const paper = {
      id:            `mcq-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      subject:       subject.trim(),
      chapter:       chapter.trim(),
      difficulty,
      totalMarks:    questions.length,   // 1 mark per question
      marksPerQuestion: 1,
      numQuestions:  questions.length,
      includeAnswers: true,
      generatedAt:   new Date().toISOString(),
      type:          'mcq',
      totalTime:     cfg.questions * cfg.timePerQ * 60,
      timePerQ:      cfg.timePerQ,
      // Store questions in grading-compatible format
      questions:     questions.map(q => ({
        number:   q.id,
        question: q.question,
        marks:    1,
        answer:   q.options[q.correct],  // correct answer text for grader
        // Keep MCQ-specific fields
        options:     q.options,
        correct:     q.correct,
        explanation: q.explanation,
      })),
    };

    await savePaper(paper);

    res.status(200).json({ success: true, paper });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

/**
 * POST /api/mcq/submit
 * Called when the student finishes the quiz.
 * Body: { paperId, studentId, answers: [{ questionNumber, selectedOption }] }
 *
 * Converts MCQ answers (selected option index) into grading-compatible format,
 * then routes through the same grading service so stats are updated automatically.
 */
export async function submitMCQResult(req, res, next) {
  try {
    const { paperId, studentId = 'student-default', studentName, answers } = req.body;

    if (!paperId)  return next(createError('"paperId" is required.', 400));
    if (!answers || !Array.isArray(answers) || answers.length === 0)
      return next(createError('"answers" must be a non-empty array.', 400));

    // Convert MCQ answers: { questionNumber, selectedOption (index) }
    // → grading format: { questionNumber, answerText }
    // We use the selected option text so the AI grader can compare it to the correct answer
    const gradingAnswers = answers.map(a => ({
      questionNumber: a.questionNumber,
      answerText:     a.selectedOptionText || `Option ${a.selectedOption}`,
    }));

    const result = await gradeSubmission({
      paperId,
      studentId,
      studentName,
      answers: gradingAnswers,
    });

    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
