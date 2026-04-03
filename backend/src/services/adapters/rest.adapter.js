/**
 * rest.adapter.js — Local REST API Adapter
 *
 * Supports:
 *   - Ollama          → http://localhost:11434  (POST /api/chat)
 *   - LM Studio       → http://localhost:1234   (POST /v1/chat/completions)
 *   - llama.cpp HTTP  → http://localhost:8080   (POST /v1/chat/completions)
 *
 * Set AI_API_FORMAT in .env to force a format:
 *   AI_API_FORMAT=ollama   → always use Ollama format
 *   AI_API_FORMAT=openai   → always use OpenAI-compatible format
 *   (leave blank = auto-detect by port)
 */

import axios from 'axios';
import { logger } from '../../utils/logger.util.js';
import { createError } from '../../utils/error.util.js';

const BASE_URL = (process.env.AI_REST_URL  || 'http://localhost:11434').replace(/\/$/, '');
const MODEL    = process.env.AI_MODEL_NAME || 'phi3';
const FORMAT   = process.env.AI_API_FORMAT || 'auto'; // 'ollama' | 'openai' | 'auto'

/**
 * @param {string} systemPrompt
 * @param {Array<{role:string,content:string}>} messages
 * @returns {Promise<string>}
 */
export async function callRestModel(systemPrompt, messages) {
  const format = resolveFormat();
  logger.info(`[REST Adapter] format=${format}  url=${BASE_URL}  model=${MODEL}`);

  try {
    return format === 'ollama'
      ? await callOllama(systemPrompt, messages)
      : await callOpenAICompat(systemPrompt, messages);
  } catch (err) {
    // Connection refused → model server not running
    if (err.code === 'ECONNREFUSED') {
      throw createError(
        `Cannot connect to model server at ${BASE_URL}. ` +
        `Start it first (e.g. "ollama serve") or set AI_MODE=mock in .env.`,
        503
      );
    }

    // The server replied but with an error status
    if (err.response) {
      const status  = err.response.status;
      const detail  = JSON.stringify(err.response.data).slice(0, 300);
      const hitUrl  = err.config?.url || '(unknown url)';
      const format  = resolveFormat();

      logger.error(`[REST Adapter] ${status} from ${hitUrl}`);
      logger.error(`[REST Adapter] Response body: ${detail}`);

      // 404 almost always means wrong endpoint path or wrong model name
      if (status === 404) {
        const hint = format === 'ollama'
          ? `Ollama returned 404. Either:\n` +
            `  1. Model "${MODEL}" is not pulled yet  →  run: ollama pull ${MODEL}\n` +
            `  2. Wrong URL — check AI_REST_URL (currently "${BASE_URL}")\n` +
            `  3. Try setting AI_API_FORMAT=openai if you're NOT using Ollama`
          : `OpenAI-compat server returned 404. Either:\n` +
            `  1. Model "${MODEL}" is not loaded in LM Studio / llama.cpp\n` +
            `  2. Wrong base URL — check AI_REST_URL (currently "${BASE_URL}")\n` +
            `  3. Try setting AI_API_FORMAT=ollama if you ARE using Ollama`;

        throw createError(hint, 502);
      }

      throw createError(
        `Model server returned HTTP ${status} at ${hitUrl}.\n` +
        `Check AI_MODEL_NAME ("${MODEL}"), AI_REST_URL, and AI_API_FORMAT in .env.\n` +
        `Server said: ${detail}`,
        502
      );
    }

    throw err;
  }
}

// ── Format resolver ───────────────────────────────────────────────────────────

function resolveFormat() {
  if (FORMAT === 'ollama') return 'ollama';
  if (FORMAT === 'openai') return 'openai';
  // Auto-detect: Ollama default port is 11434
  if (BASE_URL.includes(':11434')) return 'ollama';
  // LM Studio (1234) and llama.cpp (8080) use OpenAI-compatible format
  return 'openai';
}

// ── Ollama ────────────────────────────────────────────────────────────────────

async function callOllama(systemPrompt, messages) {
  const url = `${BASE_URL}/api/chat`;
  const payload = {
    model: MODEL,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };
  logger.info(`[REST Adapter] POST ${url}`);
  const { data } = await axios.post(url, payload, { timeout: 120_000 });
  return data?.message?.content?.trim() || 'No response from model.';
}

// ── OpenAI-compatible (LM Studio, llama.cpp, Jan, etc.) ──────────────────────

async function callOpenAICompat(systemPrompt, messages) {
  const url = `${BASE_URL}/v1/chat/completions`;
  const payload = {
    model: MODEL,
    temperature: 0.7,
    max_tokens: 512,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };
  logger.info(`[REST Adapter] POST ${url}`);
  const { data } = await axios.post(url, payload, { timeout: 120_000 });
  return data?.choices?.[0]?.message?.content?.trim() || 'No response from model.';
}
