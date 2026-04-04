/**
 * grading.service.js — AI Answer Grading & Student Stats
 *
 * Flow:
 *  1. Student submits answers (text or extracted PDF text) + paperId
 *  2. We load the original question paper to get questions + correct answers
 *  3. AI grades each answer individually → returns marks + feedback
 *  4. Result saved to data/results.json
 *  5. Student stats in data/stats.json updated
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import { logger } from '../utils/logger.util.js';
import { createError } from '../utils/error.util.js';
import { initStore } from '../utils/store.util.js';
import fs from 'fs/promises';
import path from 'path';

const AI_MODE    = process.env.AI_MODE || 'mock';
const DATA_DIR   = path.resolve(process.env.DATA_DIR || 'data');
const PAPERS_FILE  = path.join(DATA_DIR, 'papers.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const STATS_FILE   = path.join(DATA_DIR, 'stats.json');

// ── Paper storage (called by question paper service) ──────────────────────────

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

/**
 * Grade a student's submission against a saved question paper.
 *
 * @param {string} paperId        - ID of the question paper
 * @param {string} studentId      - Student identifier
 * @param {string} studentName    - Student display name
 * @param {Array}  answers        - [{ questionNumber, answerText }]
 * @returns {object}              - Full result object
 */
export async function gradeSubmission({ paperId, studentId, studentName, answers }) {
  // 1. Load the paper
  const paper = await getPaper(paperId);
  if (!paper) throw createError(`Question paper "${paperId}" not found. Generate it first.`, 404);

  if (!paper.includeAnswers) {
    // Paper was generated without answers — AI will judge based on question context
    logger.warn(`[Grading] Paper "${paperId}" has no stored answers — AI will judge independently`);
  }

  logger.info(`[Grading] Grading ${answers.length} answers for student "${studentId}" on paper "${paperId}"`);

  // 2. Grade each answer with AI
  const gradedQuestions = await gradeAllAnswers(paper, answers);

  // 3. Calculate totals
  const totalAwarded  = gradedQuestions.reduce((sum, q) => sum + q.marksAwarded, 0);
  const totalPossible = paper.totalMarks;
  const percentage    = Math.round((totalAwarded / totalPossible) * 100);
  const grade         = calculateGrade(percentage);

  // 4. Build result object
  const resultId = `result-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const result = {
    id:            resultId,
    paperId,
    studentId,
    studentName:   studentName || studentId,
    subject:       paper.subject,
    chapter:       paper.chapter,
    difficulty:    paper.difficulty,
    totalMarks:    totalPossible,
    marksAwarded:  totalAwarded,
    percentage,
    grade,
    submittedAt:   new Date().toISOString(),
    questions:     gradedQuestions,
  };

  // 5. Save result
  await saveResult(result);

  // 6. Update student stats
  await updateStats(studentId, result);

  return result;
}

// ── Per-answer AI grading ─────────────────────────────────────────────────────

async function gradeAllAnswers(paper, answers) {
  const gradedQuestions = [];

  for (const question of paper.questions) {
    const studentAnswer = answers.find(
      a => parseInt(a.questionNumber) === question.number
    );

    const answerText = studentAnswer?.answerText?.trim() || '';

    if (!answerText) {
      // No answer provided
      gradedQuestions.push({
        number:        question.number,
        question:      question.question,
        maxMarks:      question.marks,
        studentAnswer: '(No answer provided)',
        marksAwarded:  0,
        feedback:      'No answer was provided for this question.',
        correctAnswer: question.answer || null,
      });
      continue;
    }

    const graded = await gradeOneAnswer({ question, answerText, paper });
    gradedQuestions.push(graded);
  }

  return gradedQuestions;
}

async function gradeOneAnswer({ question, answerText, paper }) {
  const hasModelAnswer = !!question.answer;

  const system =
    `You are a strict but fair examiner. Grade student answers accurately. ` +
    `Always respond in this EXACT JSON format with no extra text:\n` +
    `{"marksAwarded": <number>, "feedback": "<one sentence feedback>"}`;

  const prompt =
    `Subject: ${paper.subject}\n` +
    `Chapter: ${paper.chapter}\n` +
    `Difficulty: ${paper.difficulty}\n\n` +
    `Question (${question.marks} marks): ${question.question}\n` +
    (hasModelAnswer ? `Model Answer: ${question.answer}\n` : '') +
    `\nStudent Answer: ${answerText}\n\n` +
    `Award marks out of ${question.marks}. Be fair but strict. ` +
    `Give partial marks for partially correct answers. ` +
    `Respond ONLY with the JSON format specified.`;

  let marksAwarded = 0;
  let feedback     = 'Could not evaluate this answer.';

  try {
    const raw     = await callModel(system, [{ role: 'user', content: prompt }]);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    marksAwarded = Math.min(
      Math.max(0, Math.round(parsed.marksAwarded || 0)),
      question.marks
    );
    feedback = parsed.feedback || feedback;
  } catch (err) {
    logger.warn(`[Grading] Failed to parse AI response for Q${question.number}: ${err.message}`);
    // Fallback: try to extract a number from the raw response
    const match = (err.raw || '').match(/\d+/);
    if (match) marksAwarded = Math.min(parseInt(match[0]), question.marks);
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

// ── Results persistence ───────────────────────────────────────────────────────

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

export async function getAllResults() {
  const all = await readJSON(RESULTS_FILE);
  return Object.values(all).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

// ── Student stats ─────────────────────────────────────────────────────────────

async function updateStats(studentId, result) {
  const all   = await readJSON(STATS_FILE);
  const stats = all[studentId] || createEmptyStats(studentId);

  // Total attempts
  stats.totalAttempts++;

  // Running average
  stats.totalMarksAwarded  += result.marksAwarded;
  stats.totalMarksPossible += result.totalMarks;
  stats.averageScore        = Math.round(
    (stats.totalMarksAwarded / stats.totalMarksPossible) * 100
  );

  // Per subject
  if (!stats.bySubject[result.subject]) {
    stats.bySubject[result.subject] = { attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0 };
  }
  const subj = stats.bySubject[result.subject];
  subj.attempts++;
  subj.totalAwarded  += result.marksAwarded;
  subj.totalPossible += result.totalMarks;
  subj.average        = Math.round((subj.totalAwarded / subj.totalPossible) * 100);

  // Per difficulty
  if (!stats.byDifficulty[result.difficulty]) {
    stats.byDifficulty[result.difficulty] = { attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0 };
  }
  const diff = stats.byDifficulty[result.difficulty];
  diff.attempts++;
  diff.totalAwarded  += result.marksAwarded;
  diff.totalPossible += result.totalMarks;
  diff.average        = Math.round((diff.totalAwarded / diff.totalPossible) * 100);

  // Per topic (chapter)
  const topicKey = `${result.subject}::${result.chapter}`;
  if (!stats.byTopic[topicKey]) {
    stats.byTopic[topicKey] = {
      subject: result.subject, chapter: result.chapter,
      attempts: 0, totalAwarded: 0, totalPossible: 0, average: 0,
    };
  }
  const topic = stats.byTopic[topicKey];
  topic.attempts++;
  topic.totalAwarded  += result.marksAwarded;
  topic.totalPossible += result.totalMarks;
  topic.average        = Math.round((topic.totalAwarded / topic.totalPossible) * 100);

  // Best / worst topics
  const topicList     = Object.values(stats.byTopic).filter(t => t.attempts > 0);
  stats.bestTopic     = topicList.sort((a, b) => b.average - a.average)[0] || null;
  stats.worstTopic    = topicList.sort((a, b) => a.average - b.average)[0] || null;

  stats.lastAttemptAt = result.submittedAt;
  stats.updatedAt     = new Date().toISOString();

  all[studentId] = stats;
  await writeJSON(STATS_FILE, all);
  logger.info(`[Grading] Updated stats for student "${studentId}" — avg: ${stats.averageScore}%`);

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

function createEmptyStats(studentId) {
  return {
    studentId,
    totalAttempts:      0,
    totalMarksAwarded:  0,
    totalMarksPossible: 0,
    averageScore:       0,
    bySubject:          {},
    byDifficulty:       {},
    byTopic:            {},
    bestTopic:          null,
    worstTopic:         null,
    lastAttemptAt:      null,
    updatedAt:          new Date().toISOString(),
  };
}

// ── Grade label ───────────────────────────────────────────────────────────────

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// ── JSON file helpers ─────────────────────────────────────────────────────────

async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
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
