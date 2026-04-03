/**
 * questionPaper.service.js — Question Paper Generation Logic
 *
 * Builds a structured prompt for the local Ollama model and parses
 * the response into a clean question paper object.
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import { logger } from '../utils/logger.util.js';

const AI_MODE = process.env.AI_MODE || 'mock';

// ── Subjects list ─────────────────────────────────────────────────────────────

const SUBJECTS = [
  'Science',
  'Mathematics',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Economics',
];

export function getSubjects() {
  return SUBJECTS;
}

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * @param {{ subject, chapter, difficulty, totalMarks, numQuestions, includeAnswers }} options
 * @returns {Promise<{ title, subject, chapter, difficulty, totalMarks, marksPerQuestion, generatedAt, questions[] }>}
 */
export async function generateQuestionPaper(options) {
  const { subject, chapter, difficulty, totalMarks, numQuestions, includeAnswers } = options;

  const marksPerQuestion = Math.floor(totalMarks / numQuestions);

  const systemPrompt = buildSystemPrompt(includeAnswers);
  const userPrompt   = buildUserPrompt({ subject, chapter, difficulty, totalMarks, numQuestions, marksPerQuestion, includeAnswers });

  logger.info(`[QP Service] Generating ${numQuestions} ${difficulty} questions on "${chapter}" (${subject})`);

  // Send as a single user message — no conversation history needed
  const raw = await callModel(systemPrompt, [{ role: 'user', content: userPrompt }]);

  const questions = parseQuestions(raw, numQuestions, marksPerQuestion, includeAnswers);

  return {
    title:             `${subject} — ${chapter}`,
    subject,
    chapter,
    difficulty,
    totalMarks,
    marksPerQuestion,
    numQuestions:      questions.length,
    includeAnswers,
    generatedAt:       new Date().toISOString(),
    questions,
  };
}

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildSystemPrompt(includeAnswers) {
  return (
    `You are an expert teacher and exam paper setter. ` +
    `Your job is to generate clear, well-structured exam questions. ` +
    `Always respond with ONLY a numbered list of questions — no preamble, no extra text. ` +
    (includeAnswers
      ? `After each question, on a new line write "Answer: " followed by a concise answer.`
      : `Do NOT include answers.`)
  );
}

function buildUserPrompt({ subject, chapter, difficulty, totalMarks, numQuestions, marksPerQuestion, includeAnswers }) {
  const difficultyGuide = {
    easy:   'simple recall and basic understanding questions',
    medium: 'application and analytical questions requiring explanation',
    hard:   'complex evaluation, problem-solving, and critical thinking questions',
  }[difficulty];

  return (
    `Generate exactly ${numQuestions} exam questions for the following:\n\n` +
    `Subject:    ${subject}\n` +
    `Chapter:    ${chapter}\n` +
    `Difficulty: ${difficulty.toUpperCase()} — ${difficultyGuide}\n` +
    `Marks:      ${marksPerQuestion} marks per question (${totalMarks} total)\n\n` +
    `Rules:\n` +
    `- Number each question (1. 2. 3. ...)\n` +
    `- Each question must be clear and self-contained\n` +
    `- Match the difficulty level strictly\n` +
    (includeAnswers ? `- After each question write "Answer: <concise answer>"\n` : `- Do NOT include answers\n`) +
    `- Output ONLY the questions${includeAnswers ? ' and answers' : ''}, nothing else`
  );
}

// ── Response parser ───────────────────────────────────────────────────────────

/**
 * Parses raw model output into a structured array of question objects.
 */
function parseQuestions(raw, numQuestions, marksPerQuestion, includeAnswers) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const questions = [];
  let   current   = null;

  for (const line of lines) {
    // Detect numbered question: "1.", "1)", "Q1.", "Q1)"
    const questionMatch = line.match(/^(?:Q\s*)?(\d+)[.)]\s+(.+)/i);

    if (questionMatch) {
      if (current) questions.push(current);
      current = {
        number:   parseInt(questionMatch[1], 10),
        question: questionMatch[2].trim(),
        marks:    marksPerQuestion,
        ...(includeAnswers && { answer: null }),
      };
      continue;
    }

    // Detect answer line
    if (includeAnswers && current && /^answer\s*:/i.test(line)) {
      current.answer = line.replace(/^answer\s*:\s*/i, '').trim();
      continue;
    }

    // Continuation of current question text
    if (current && !current.answer) {
      current.question += ' ' + line;
    }
  }

  if (current) questions.push(current);

  // Fallback: if parsing failed, wrap raw text as a single question
  if (questions.length === 0) {
    logger.warn('[QP Service] Could not parse structured questions — returning raw output');
    return [{
      number:   1,
      question: raw.trim(),
      marks:    marksPerQuestion * numQuestions,
      ...(includeAnswers && { answer: null }),
    }];
  }

  return questions.slice(0, numQuestions);
}

// ── Model router ──────────────────────────────────────────────────────────────

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
