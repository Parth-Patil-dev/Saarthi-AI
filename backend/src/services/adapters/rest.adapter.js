/**
 * rest.adapter.js — Ollama / OpenAI-compat adapter with streaming support
 */

import axios from 'axios';
import { logger } from '../../utils/logger.util.js';
import { createError } from '../../utils/error.util.js';

const BASE_URL = (process.env.AI_REST_URL  || 'http://localhost:11434').replace(/\/$/, '');
const MODEL    = process.env.AI_MODEL_NAME || 'phi:latest';
const FORMAT   = process.env.AI_API_FORMAT || 'auto';

function resolveFormat() {
  if (FORMAT === 'ollama') return 'ollama';
  if (FORMAT === 'openai') return 'openai';
  return BASE_URL.includes(':11434') ? 'ollama' : 'openai';
}

function handleAxiosError(err) {
  if (err.code === 'ECONNREFUSED') {
    throw createError(
      `Cannot connect to model server at ${BASE_URL}. Start Ollama first or set AI_MODE=mock.`,
      503
    );
  }
  if (err.response) {
    const status = err.response.status;
    const detail = JSON.stringify(err.response.data).slice(0, 200);
    const hitUrl = err.config?.url || '';
    if (status === 404) {
      throw createError(
        `Model server returned 404 at ${hitUrl}.\n` +
        `Check AI_MODEL_NAME ("${MODEL}") — run "ollama list" to see available models.`,
        502
      );
    }
    throw createError(`Model server returned ${status}: ${detail}`, 502);
  }
  throw err;
}

// ── Non-streaming ─────────────────────────────────────────────────────────────

export async function callRestModel(systemPrompt, messages) {
  const format = resolveFormat();
  logger.info(`[REST] format=${format} model=${MODEL}`);
  try {
    return format === 'ollama'
      ? await callOllama(systemPrompt, messages)
      : await callOpenAICompat(systemPrompt, messages);
  } catch (err) { handleAxiosError(err); }
}

async function callOllama(systemPrompt, messages) {
  const { data } = await axios.post(`${BASE_URL}/api/chat`, {
    model: MODEL, stream: false,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  }, { timeout: 120_000 });
  return data?.message?.content?.trim() || 'No response.';
}

async function callOpenAICompat(systemPrompt, messages) {
  const { data } = await axios.post(`${BASE_URL}/v1/chat/completions`, {
    model: MODEL, temperature: 0.7, max_tokens: 512,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  }, { timeout: 120_000 });
  return data?.choices?.[0]?.message?.content?.trim() || 'No response.';
}

// ── Streaming ─────────────────────────────────────────────────────────────────

/**
 * Stream tokens from Ollama.
 * @param {string} systemPrompt
 * @param {Array}  messages
 * @param {function} onToken  — called with each text chunk
 * @returns {Promise<string>} — full assembled reply
 */
export async function streamRestModel(systemPrompt, messages, onToken) {
  const format = resolveFormat();
  logger.info(`[REST stream] format=${format} model=${MODEL}`);

  try {
    return format === 'ollama'
      ? await streamOllama(systemPrompt, messages, onToken)
      : await streamOpenAICompat(systemPrompt, messages, onToken);
  } catch (err) { handleAxiosError(err); }
}

async function streamOllama(systemPrompt, messages, onToken) {
  const response = await axios.post(
    `${BASE_URL}/api/chat`,
    { model: MODEL, stream: true, messages: [{ role: 'system', content: systemPrompt }, ...messages] },
    { responseType: 'stream', timeout: 120_000 }
  );

  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    response.data.on('data', chunk => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json  = JSON.parse(line);
          const token = json?.message?.content || '';
          if (token) { full += token; onToken(token); }
          if (json.done) resolve(full);
        } catch { /* partial JSON — skip */ }
      }
    });

    response.data.on('end',   () => resolve(full));
    response.data.on('error', reject);
  });
}

async function streamOpenAICompat(systemPrompt, messages, onToken) {
  const response = await axios.post(
    `${BASE_URL}/v1/chat/completions`,
    { model: MODEL, temperature: 0.7, max_tokens: 512, stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages] },
    { responseType: 'stream', timeout: 120_000 }
  );

  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    response.data.on('data', chunk => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        const trimmed = line.replace(/^data: /, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;
        try {
          const json  = JSON.parse(trimmed);
          const token = json?.choices?.[0]?.delta?.content || '';
          if (token) { full += token; onToken(token); }
        } catch { /* skip */ }
      }
    });

    response.data.on('end',   () => resolve(full));
    response.data.on('error', reject);
  });
}
