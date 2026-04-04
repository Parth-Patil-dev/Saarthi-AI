/**
 * grading.service.js — AI Answer Grading & Student Stats
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import { generateAdvice } from './advice.service.js';
import { logger } from '../utils/logger.util.js';
import { createError } from '../utils/error.util.js';
import { initStore } from '../utils/store.util.js';
import fs from 'fs/promises';
import path from 'path';

const AI_MODE      = process.env.AI_MODE || 'mock';
const DATA_DIR     = path.resolve(process.env.DATA_DIR || 'data');
const PAPERS_FILE  = path.join(DATA_DIR, 'papers.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const STATS_FILE   = path.join(DATA_DIR, 'stats.json');

// ── Paper storage ─────────────────────────────────────────────────────────────

export async function savePaper(paper) {
  const all = await readJSON(PAPERS_FILE);
  all[paper.id] = paper;
  await writeJSON(PAPERS_FILE, all);
  return paper;
}

export async function getPaper(paperId) {
  const all = await readJSON(PAPERS_FILE);
  return all[paperId] || null;
}

export async function listPapers() {
  const all = await readJSON(PAPERS_FILE);
  return Object.values(all).sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
}

// ── Main grading entry point ──────────────────────────────────────────────────

export async function gradeSubmission({ paperId, studentId, studentName, answers }) {
  const paper = await getPaper(paperId);
  if (!paper) throw createError(`Question paper "${paperId}" not found.`, 404);

  logger.info(`[Grading] Grading ${answers.length} answers for "${studentId}" on paper "${paperId}"`);

  const gradedQuestions = await gradeAllAnswers(paper, answers);

  const totalAwarded  = gradedQuestions.reduce((sum, q) => sum + q.marksAwarded, 0);
  const totalPossible = paper.totalMarks;
  const percentage    = Math.round((totalAwarded / totalPossible) * 100);

  const resultId = `result-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const result = {
    id:           resultId,
    paperId,
    studentId,
    studentName:  studentName || studentId,
    subject:      paper.subject,
    chapter:      paper.chapter,
    difficulty:   paper.difficulty,
    totalMarks:   totalPossible,
    marksAwarded: totalAwarded,
    percentage,
    grade:        calculateGrade(percentage),
    submittedAt:  new Date().toISOString(),
    questions:    gradedQuestions,
    advice:       null, // populated lazily when student requests it
  };

  await saveResult(result);
  await updateStats(studentId, result);

  return result;
}

// ── Advice (lazy — generated on demand, cached on result) ─────────────────────

export async function getAdviceForResult(resultId) {
  const all    = await readJSON(RESULTS_FILE);
  const result = all[resultId];
  if (!result) throw createError(`Result "${resultId}" not found.`, 404);

  // Return cached advice if already generated
  if (result.advice) return result.advice;

  const advice = await generateAdvice(result);

  // Cache it back onto the result
  result.advice = advice;
  all[resultId] = result;
  await writeJSON(RESULTS_FILE, all);

  return advice;
}

// ── Results CRUD ──────────────────────────────────────────────────────────────

async function saveResult(result) {
  const all = await readJSON(RESULTS_FILE);
  all[result.id] = result;
  await writeJSON(RESULTS_FILE, all);
  logger.info(`[Grading] Saved result ${result.id} — ${result.marksAwarded}/${result.totalMarks}`);
}

export async function getResult(resultId) {
  const all = await readJSON(RESULTS_FILE);
  const r   = all[resultId];
  if (!r) throw createError(`Result "${resultId}" not found.`, 404);
  return r;
}

export async function getStudentResults(studentId) {
  const all = await readJSON(RESULTS_FILE);
  return Object.values(all)
    .filter(r => r.studentId === studentId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/**
 * Get all results with optional search + filter
 * @param {{ subject?, chapter?, studentId?, search? }} filters
 */
export async function getAllResults(filters = {}) {
  const all     = await readJSON(RESULTS_FILE);
  let   results = Object.values(all);

  if (filters.subject) {
    results = results.filter(r => r.subject?.toLowerCase() === filters.subject.toLowerCase());
  }
  if (filters.chapter) {
    results = results.filter(r => r.chapter?.toLowerCase().includes(filters.chapter.toLowerCase()));
  }
  if (filters.studentId) {
    results = results.filter(r => r.studentId === filters.studentId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(r =>
      r.subject?.toLowerCase().includes(q) ||
      r.chapter?.toLowerCase().includes(q) ||
      r.studentName?.toLowerCase().includes(q)
    );
  }

  return results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

// ── Student stats ─────────────────────────────────────────────────────────────

async function updateStats(studentId, result) {
  const all   = await readJSON(STATS_FILE);
  const stats = all[studentId] || createEmptyStats(studentId);

  stats.totalAttempts++;
  stats.totalMarksAwarded  += result.marksAwarded;
  stats.totalMarksPossible += result.totalMarks;
  stats.averageScore        = Math.round(
    (stats.totalMarksAwarded / stats.totalMarksPossible) * 100
  );

  // Per subject
  const subj = stats.bySubject[result.subject] ||
    (stats.bySubject[result.subject] = { attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0 });
  subj.attempts++;
  subj.totalAwarded  += result.marksAwarded;
  subj.totalPossible += result.totalMarks;
  subj.average        = Math.round((subj.totalAwarded / subj.totalPossible) * 100);

  // Per difficulty
  const diff = stats.byDifficulty[result.difficulty] ||
    (stats.byDifficulty[result.difficulty] = { attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0 });
  diff.attempts++;
  diff.totalAwarded  += result.marksAwarded;
  diff.totalPossible += result.totalMarks;
  diff.average        = Math.round((diff.totalAwarded / diff.totalPossible) * 100);

  // Per topic
  const topicKey = `${result.subject}::${result.chapter}`;
  const topic    = stats.byTopic[topicKey] ||
    (stats.byTopic[topicKey] = { subject: result.subject, chapter: result.chapter, attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0 });
  topic.attempts++;
  topic.totalAwarded  += result.marksAwarded;
  topic.totalPossible += result.totalMarks;
  topic.average        = Math.round((topic.totalAwarded / topic.totalPossible) * 100);

  // Best / worst
  const topicList  = Object.values(stats.byTopic).filter(t => t.attempts > 0);
  stats.bestTopic  = [...topicList].sort((a, b) => b.average - a.average)[0] || null;
  stats.worstTopic = [...topicList].sort((a, b) => a.average - b.average)[0] || null;

  stats.lastAttemptAt = result.submittedAt;
  stats.updatedAt     = new Date().toISOString();

  all[studentId] = stats;
  await writeJSON(STATS_FILE, all);
  return stats;
}

export async function getStudentStats(studentId) {
  const all = await readJSON(STATS_FILE);
  return all[studentId] || createEmptyStats(studentId);
}

export async function getAllStats() {
  const all = await readJSON(STATS_FILE);
  return Object.values(all);
}

// ── Per-answer grading ────────────────────────────────────────────────────────

async function gradeAllAnswers(paper, answers) {
  const gradedQuestions = [];

  for (const question of paper.questions) {
   const studentAnswer = answers.find(
  a => parseInt(a.questionNumber) === question.number
) || (answers.length === 1 && answers[0].questionNumber === 0 ? answers[0] : null);
    const answerText = studentAnswer?.answerText?.trim() || '';

    if (!answerText) {
      gradedQuestions.push({
        number:        question.number,
        question:      question.question,
        maxMarks:      question.marks,
        studentAnswer: '(No answer provided)',
        marksAwarded:  0,
        feedback:      'No answer was provided.',
        correctAnswer: question.answer || null,
      });
      continue;
    }

    gradedQuestions.push(await gradeOneAnswer({ question, answerText, paper }));
  }

  return gradedQuestions;
}

async function gradeOneAnswer({ question, answerText, paper }) {
  const system =
    `You are a strict but fair examiner. Respond ONLY in this exact JSON format:\n` +
    `{"marksAwarded": <number>, "feedback": "<one sentence>"}`;

  const prompt =
    `Subject: ${paper.subject} | Chapter: ${paper.chapter} | Difficulty: ${paper.difficulty}\n` +
    `Question (${question.marks} marks): ${question.question}\n` +
    (question.answer ? `Model Answer: ${question.answer}\n` : '') +
    `Student Answer (may contain all answers in one block — find the answer relevant to this specific question):\n${answerText}\n\n` +
    `Award marks out of ${question.marks}. Give partial marks for partial answers. JSON only.`;

  let marksAwarded = 0;
  let feedback     = 'Could not evaluate.';

  try {
    const raw    = await callModel(system, [{ role: 'user', content: prompt }]);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    marksAwarded = Math.min(Math.max(0, Math.round(parsed.marksAwarded || 0)), question.marks);
    feedback     = parsed.feedback || feedback;
  } catch (err) {
    logger.warn(`[Grading] Parse error Q${question.number}: ${err.message}`);
  }

  return {
    number:        question.number,
    question:      question.question,
    maxMarks:      question.marks,
    studentAnswer: answerText,
    marksAwarded,
    feedback,
    correctAnswer: question.answer || null,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateGrade(p) {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
}

function createEmptyStats(studentId) {
  return {
    studentId, totalAttempts: 0, totalMarksAwarded: 0,
    totalMarksPossible: 0, averageScore: 0,
    bySubject: {}, byDifficulty: {}, byTopic: {},
    bestTopic: null, worstTopic: null,
    lastAttemptAt: null, updatedAt: new Date().toISOString(),
  };
}

async function readJSON(filePath) {
  try { return JSON.parse(await fs.readFile(filePath, 'utf-8')); }
  catch { return {}; }
}

async function writeJSON(filePath, data) {
  await initStore();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
