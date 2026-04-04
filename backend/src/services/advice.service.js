/**
 * advice.service.js — AI-generated improvement advice for a graded result
 *
 * Called when the student clicks "View Advice".
 * Advice is generated once and cached on the result object to avoid re-calling the model.
 */

import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import { logger } from '../utils/logger.util.js';

const AI_MODE = process.env.AI_MODE || 'mock';

/**
 * Generate improvement advice for a graded result.
 * @param {object} result - Full result object from grading.service
 * @returns {Promise<{ overall: string, perQuestion: [{number, advice}] }>}
 */
export async function generateAdvice(result) {
  logger.info(`[Advice] Generating advice for result ${result.id}`);

  const weakQuestions = result.questions.filter(
    q => q.marksAwarded < q.maxMarks
  );

  const system =
    `You are a helpful teacher giving constructive feedback to a student. ` +
    `Be encouraging but specific. Respond ONLY in this JSON format with no extra text:\n` +
    `{"overall": "<2-3 sentence overall feedback>", "perQuestion": [{"number": <n>, "advice": "<specific tip>"}]}`;

  const prompt =
    `Student scored ${result.marksAwarded}/${result.totalMarks} (${result.percentage}%) ` +
    `on ${result.subject} — ${result.chapter} (${result.difficulty} difficulty).\n\n` +
    `Questions where marks were lost:\n` +
    weakQuestions.map(q =>
      `Q${q.number}: "${q.question}"\n` +
      `Student answered: "${q.studentAnswer?.slice(0, 200)}"\n` +
      `Got ${q.marksAwarded}/${q.maxMarks} — Examiner said: "${q.feedback}"`
    ).join('\n\n') +
    `\n\nGive specific, actionable advice to improve. Focus on what to study and how to write better answers.`;

  try {
    const raw     = await callModel(system, [{ role: 'user', content: prompt }]);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    logger.warn(`[Advice] Failed to parse advice JSON: ${err.message}`);
    // Fallback: return plain text wrapped in expected shape
    return {
      overall: `You scored ${result.percentage}%. Review the questions you got wrong and focus on understanding the core concepts.`,
      perQuestion: weakQuestions.map(q => ({
        number: q.number,
        advice: `Review this topic and practice writing more complete answers.`,
      })),
    };
  }
}

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
