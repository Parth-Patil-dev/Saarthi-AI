/**
 * mock.adapter.js — Mock Model Adapter
 *
 * Returns canned / rule-based responses so you can develop and test
 * the API without running a local model.
 *
 * Set AI_MODE=mock in .env to use this adapter.
 */

import { logger } from '../../utils/logger.util.js';

/**
 * Simulates a model response.
 *
 * @param {string} systemPrompt
 * @param {Array<{role:string, content:string}>} messages
 * @returns {Promise<string>}
 */
export async function callMockModel(systemPrompt, messages) {
  // Simulate network latency
  await sleep(300);

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user')?.content || '';

  logger.info(`[Mock Adapter] Generating mock reply for: "${lastUserMessage.slice(0, 60)}"`);

  const hasPdfContext = systemPrompt.includes('PDF CONTENT START');

  return generateMockReply(lastUserMessage, hasPdfContext, messages.length);
}

// ── Rule-based mock replies ───────────────────────────────────────────────────

function generateMockReply(message, hasPdf, historyLength) {
  const lc = message.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|greetings)/i.test(lc)) {
    return `Hello! I'm a mock AI running in development mode. Ask me anything — ` +
           `or upload a PDF and ask questions about it. 😊`;
  }

  // PDF-related question when PDF is loaded
  if (hasPdf && /pdf|document|file|content|text/i.test(lc)) {
    return `I have the PDF content available in my context. ` +
           `In production mode (AI_MODE=rest) I would search through the document ` +
           `and answer your question specifically. For now, this is a mock response.`;
  }

  // PDF question but no PDF loaded
  if (!hasPdf && /pdf|document|file/i.test(lc)) {
    return `No PDF has been uploaded yet. Use POST /api/upload to upload a PDF, ` +
           `then ask your questions and I'll answer based on its content.`;
  }

  // History acknowledgement
  if (historyLength > 2) {
    return `(Mock reply #${Math.ceil(historyLength / 2)}) ` +
           `I'm keeping track of our conversation. ` +
           `You said: "${message.slice(0, 80)}". ` +
           `In production, the real model would give a thoughtful answer here.`;
  }

  // Default
  return (
    `[Mock Mode] You asked: "${message.slice(0, 100)}". ` +
    `This is a placeholder response. ` +
    `Set AI_MODE=rest in .env and start your local model server to get real AI replies.`
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
