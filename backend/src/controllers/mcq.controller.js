// mcq.controller.js

import { generateMCQ } from '../services/mcq.service.js';
import { savePaper, saveResult, getPaper, listPapers } from '../services/grading.service.js';
import { createError } from '../utils/error.util.js';

const DIFFICULTY_CONFIG = {
  easy:   { questions: 5,  timePerQ: 3 },
  medium: { questions: 8,  timePerQ: 2 },
  hard:   { questions: 10, timePerQ: 1 },
};

// POST /api/mcq/generate  (unchanged)
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

    const paper = {
      id:               `mcq-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      subject:          subject.trim(),
      chapter:          chapter.trim(),
      difficulty,
      totalMarks:       questions.length,
      marksPerQuestion: 1,
      numQuestions:     questions.length,
      includeAnswers:   true,
      generatedAt:      new Date().toISOString(),
      type:             'mcq',
      totalTime:        cfg.questions * cfg.timePerQ * 60,
      timePerQ:         cfg.timePerQ,
      questions:        questions.map(q => ({
        number:      q.id,
        question:    q.question,
        marks:       1,
        answer:      q.options[q.correct],
        options:     q.options,
        correct:     q.correct,          // ← correct option index, used for grading
        explanation: q.explanation,
      })),
    };

    await savePaper(paper);
    res.status(200).json({ success: true, paper });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// POST /api/mcq/submit
export async function submitMCQResult(req, res, next) {
  try {
    const {
      paperId,
      studentId   = 'student-default',
      studentName = 'Student',
      answers,          // [{ questionNumber, selectedOption (index), selectedOptionText }]
      timeSpent,        // optional seconds
    } = req.body;

    if (!paperId) return next(createError('"paperId" is required.', 400));
    if (!Array.isArray(answers) || answers.length === 0)
      return next(createError('"answers" must be a non-empty array.', 400));

    // 1. Load the saved paper so we have the correct indices
    const paper = await getPaper(paperId);
    if (!paper) return next(createError(`Paper "${paperId}" not found.`, 404));

    // 2. Grade by direct index comparison — no AI needed for MCQ
    const gradedQuestions = paper.questions.map(q => {
      const submitted = answers.find(a => a.questionNumber === q.number);
      const selectedIdx = submitted?.selectedOption ?? -1;
      const isCorrect   = selectedIdx === q.correct;

      return {
        questionNumber:     q.number,
        question:           q.question,
        selectedOption:     selectedIdx,
        selectedOptionText: submitted?.selectedOptionText ?? '(No answer)',
        correctOption:      q.correct,
        correctOptionText:  q.options[q.correct],
        isCorrect,
        marksAwarded:       isCorrect ? 1 : 0,
        marksAvailable:     1,
        explanation:        q.explanation,
      };
    });

    const totalMarksAwarded = gradedQuestions.reduce((s, q) => s + q.marksAwarded, 0);
    const totalMarks        = paper.questions.length;
    const percentage        = Math.round((totalMarksAwarded / totalMarks) * 100);

    // 3. Build a result object consistent with your grading service's schema
    const result = {
      id:                 `result-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      paperId,
      studentId,
      studentName,
      subject:            paper.subject,
      chapter:            paper.chapter,
      difficulty:         paper.difficulty,
      type:               'mcq',
      submittedAt:        new Date().toISOString(),
      timeSpent:          timeSpent ?? null,
      totalMarksAwarded,
      totalMarks,
      percentage,
      passed:             percentage >= 50,
      gradedQuestions,
    };

    // 4. Persist the result
    await saveResult(result);

    res.status(200).json({ success: true, result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/mcq/papers?subject=Science
export async function listSavedMCQPapers(req, res, next) {
  try {
    const { subject } = req.query;
    const papers = await listPapers();

    const mcqPapers = papers
      .filter(p => p.type === 'mcq')
      .filter(p => !subject || p.subject?.toLowerCase() === String(subject).toLowerCase());

    res.status(200).json({ success: true, count: mcqPapers.length, papers: mcqPapers });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/mcq/papers/:paperId
export async function getSavedMCQPaper(req, res, next) {
  try {
    const paper = await getPaper(req.params.paperId);
    if (!paper || paper.type !== 'mcq') {
      return next(createError(`MCQ paper "${req.params.paperId}" not found.`, 404));
    }

    res.status(200).json({ success: true, paper });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}