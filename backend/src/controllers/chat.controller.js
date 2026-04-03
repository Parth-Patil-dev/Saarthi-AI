/**
 * chat.controller.js — Chat Request Handlers
 */

import {
  getChatReply,
  getHistory,
  getAllSessions,
  resetConversation,
  removeSession,
} from '../services/chat.service.js';
import { createError } from '../utils/error.util.js';

// POST /api/chat
// Body: { message, sessionId? }
export async function sendMessage(req, res, next) {
  try {
    const { message, sessionId } = req.body;
    const result = await getChatReply(message, sessionId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/chat/history?sessionId=xxx
export async function fetchHistory(req, res, next) {
  try {
    const sessionId = req.query.sessionId || 'default';
    const history   = await getHistory(sessionId);
    res.status(200).json({ success: true, ...history });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// GET /api/chat/sessions
export async function fetchSessions(req, res, next) {
  try {
    const sessions = await getAllSessions();
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// DELETE /api/chat/history?sessionId=xxx  — clears messages, keeps session
export async function clearHistory(req, res, next) {
  try {
    const sessionId = req.query.sessionId || 'default';
    await resetConversation(sessionId);
    res.status(200).json({ success: true, message: `Session "${sessionId}" cleared.` });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// DELETE /api/chat/sessions/:sessionId  — permanently deletes session
export async function deleteSessionHandler(req, res, next) {
  try {
    const { sessionId } = req.params;
    await removeSession(sessionId);
    res.status(200).json({ success: true, message: `Session "${sessionId}" deleted.` });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}
