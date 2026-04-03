/**
 * chat.service.js — Core AI Chat Logic with Session Persistence
 *
 * Sessions are saved to data/sessions/session-<id>.json after every message.
 * On startup, the last active session is automatically reloaded.
 */

import { getPdfContext } from './pdf.service.js';
import { callRestModel } from './adapters/rest.adapter.js';
import { callMockModel } from './adapters/mock.adapter.js';
import {
  saveSession,
  loadSession,
  listSessions,
  deleteSession,
  initStore,
} from '../utils/store.util.js';
import { logger } from '../utils/logger.util.js';

const CONTEXT_WINDOW  = parseInt(process.env.CONTEXT_WINDOW || '6', 10);
const AI_MODE         = process.env.AI_MODE || 'mock';
const DEFAULT_SESSION = 'default';

// In-memory cache: sessionId → session object
const sessionCache = new Map();

// ── Startup ───────────────────────────────────────────────────────────────────

export async function initChatService() {
  await initStore();
  const saved = await loadSession(DEFAULT_SESSION);
  if (saved) {
    sessionCache.set(DEFAULT_SESSION, saved);
    logger.info(
      `[Chat] Resumed session "${DEFAULT_SESSION}" — ${saved.messages.length} messages loaded`
    );
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getChatReply(userMessage, sessionId = DEFAULT_SESSION) {
  const session = await getOrCreateSession(sessionId);

  session.messages.push({ role: 'user', content: userMessage });
  session.updatedAt = new Date().toISOString();

  // Auto-title from first message
  if (session.messages.length === 1) {
    session.title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '…' : '');
  }

  const systemPrompt   = buildSystemPrompt();
  const recentMessages = session.messages.slice(-CONTEXT_WINDOW);

  logger.info(`[Chat] session="${sessionId}" messages=${session.messages.length} mode=${AI_MODE}`);

  const reply = await callModel(systemPrompt, recentMessages);

  session.messages.push({ role: 'assistant', content: reply });
  session.updatedAt = new Date().toISOString();

  sessionCache.set(sessionId, session);
  await saveSession(sessionId, session);

  return {
    reply,
    sessionId,
    historyLength: session.messages.length,
    model: process.env.AI_MODEL_NAME || AI_MODE,
  };
}

export async function getHistory(sessionId = DEFAULT_SESSION) {
  const session = await getOrCreateSession(sessionId);
  return {
    sessionId,
    title:        session.title,
    createdAt:    session.createdAt,
    updatedAt:    session.updatedAt,
    messages:     session.messages,
    messageCount: session.messages.length,
  };
}

export async function getAllSessions() {
  return listSessions();
}

export async function resetConversation(sessionId = DEFAULT_SESSION) {
  const session     = await getOrCreateSession(sessionId);
  session.messages  = [];
  session.title     = 'New conversation';
  session.updatedAt = new Date().toISOString();
  sessionCache.set(sessionId, session);
  await saveSession(sessionId, session);
  logger.info(`[Chat] Session "${sessionId}" cleared.`);
}

export async function removeSession(sessionId) {
  sessionCache.delete(sessionId);
  await deleteSession(sessionId);
  logger.info(`[Chat] Session "${sessionId}" deleted.`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getOrCreateSession(sessionId) {
  if (sessionCache.has(sessionId)) return sessionCache.get(sessionId);

  const saved = await loadSession(sessionId);
  if (saved) {
    sessionCache.set(sessionId, saved);
    return saved;
  }

  const now     = new Date().toISOString();
  const session = {
    id:        sessionId,
    title:     'New conversation',
    createdAt: now,
    updatedAt: now,
    messages:  [],
  };
  sessionCache.set(sessionId, session);
  return session;
}

function buildSystemPrompt() {
  const base   = `You are a helpful, concise AI assistant. Answer clearly and accurately.`;
  const pdfCtx = getPdfContext();
  if (!pdfCtx) return base;

  const MAX_PDF_CHARS = 4000;
  const pdfSnippet    = pdfCtx.text.length > MAX_PDF_CHARS
    ? pdfCtx.text.slice(0, MAX_PDF_CHARS) + '\n[...content truncated...]'
    : pdfCtx.text;

  return (
    `${base}\n\n` +
    `The user has uploaded a PDF titled "${pdfCtx.filename}". ` +
    `Use the following extracted text to answer questions:\n\n` +
    `--- PDF CONTENT START ---\n${pdfSnippet}\n--- PDF CONTENT END ---`
  );
}

async function callModel(systemPrompt, messages) {
  switch (AI_MODE) {
    case 'rest':  return callRestModel(systemPrompt, messages);
    case 'mock':
    default:      return callMockModel(systemPrompt, messages);
  }
}
