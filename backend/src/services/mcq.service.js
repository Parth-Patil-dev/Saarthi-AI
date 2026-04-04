/**
 * mcq.service.js — MCQ Generation with AI-generated options
 *
 * Calls the model once per quiz with a prompt that returns
 * structured JSON: questions with 4 options, correct index, and explanation.
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel }  from './adapters/mock.adapter.js';
import { logger }         from '../utils/logger.util.js';
import { createError }    from '../utils/error.util.js';

const AI_MODE = process.env.AI_MODE || 'mock';

/**
 * Generate MCQ questions with options.
 * @param {{ subject, chapter, difficulty, count }} opts
 * @returns {Promise<Array<{ id, question, options, correct, explanation }>>}
 */
export async function generateMCQ({ subject, chapter, difficulty, count }) {
  const difficultyGuide = {
    easy:   'basic recall and simple understanding',
    medium: 'application and reasoning',
    hard:   'analysis, evaluation, and problem solving',
  }[difficulty] || 'medium difficulty';

  const system =
    `You are an expert teacher creating multiple choice questions. ` +
    `Respond ONLY with a valid JSON array — no preamble, no markdown, no extra text. ` +
    `Each element must have exactly these fields: ` +
    `"question" (string), "options" (array of exactly 4 strings), ` +
    `"correct" (0-based index of the correct option, integer), ` +
    `"explanation" (one sentence explaining why the correct answer is right).`;

  const prompt =
    `Generate exactly ${count} multiple choice questions for:\n` +
    `Subject: ${subject}\n` +
    `Chapter/Topic: ${chapter}\n` +
    `Difficulty: ${difficulty.toUpperCase()} — ${difficultyGuide}\n\n` +
    `Rules:\n` +
    `- Each question must have exactly 4 options\n` +
    `- Only one option must be correct\n` +
    `- The 3 wrong options (distractors) must be plausible but clearly wrong\n` +
    `- The correct answer should NOT always be option 0 — vary positions\n` +
    `- The explanation must be concise and educational\n` +
    `- Return ONLY a JSON array, nothing else\n\n` +
    `Example format:\n` +
    `[{"question":"...","options":["A","B","C","D"],"correct":2,"explanation":"..."}]`;

  logger.info(`[MCQ] Generating ${count} ${difficulty} MCQs on "${chapter}" (${subject})`);

  const raw = await callModel(system, [{ role: 'user', content: prompt }]);

  return parseMCQ(raw, count, subject, chapter);
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseMCQ(raw, count, subject, chapter) {
  try {
    const cleaned  = raw.replace(/```json|```/g, '').trim();
    const parsed   = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) throw new Error('Response is not an array');

    const questions = parsed
      .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4)
      .slice(0, count)
      .map((q, i) => ({
        id:          i + 1,
        question:    q.question,
        options:     q.options.map(String),
        correct:     Math.min(Math.max(0, parseInt(q.correct) || 0), 3),
        explanation: q.explanation || 'See your textbook for the correct explanation.',
      }));

    if (questions.length === 0) throw new Error('No valid questions parsed');

    logger.info(`[MCQ] Parsed ${questions.length}/${count} valid questions`);
    return questions;

  } catch (err) {
    logger.warn(`[MCQ] JSON parse failed — using fallback. Error: ${err.message}`);
    // Fallback: generate placeholder questions so the quiz still works
    return Array.from({ length: count }, (_, i) => ({
      id:          i + 1,
      question:    `Question ${i + 1}: What is a key concept of "${chapter}" in ${subject}?`,
      options:     [
        `The primary definition of ${chapter}`,
        `An unrelated concept from another topic`,
        `A common misconception about ${chapter}`,
        `A historical fact unrelated to ${chapter}`,
      ],
      correct:      0,
      explanation: `The first option correctly defines the core concept of ${chapter}.`,
    }));
  }
}

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
