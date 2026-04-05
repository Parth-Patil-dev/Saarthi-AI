/**
 * chat.controller.js — Chat Request Handlers (with streaming support)
 */

import {
  getChatReply,
  getHistory,
  getAllSessions,
  resetConversation,
  removeSession,
} from '../services/chat.service.js';
import { streamChatReply } from '../services/chat.service.js';
import { createError } from '../utils/error.util.js';

// POST /api/chat  — standard JSON response
export async function sendMessage(req, res, next) {
  try {
    const { message, sessionId } = req.body;
    const result = await getChatReply(message, sessionId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// POST /api/chat/stream  — Server-Sent Events streaming
export async function streamMessage(req, res, next) {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      return next(createError('"message" is required.', 400));
    }

    // SSE headers
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    await streamChatReply({
      message,
      sessionId,
      onToken:  (token)  => send('token',  { token }),
      onDone:   (result) => send('done',   result),
      onError:  (err)    => send('error',  { message: err.message }),
    });

    res.end();
  } catch (err) {
    // If headers already sent, just end
    if (!res.headersSent) next(createError(err.message, err.status || 500));
    else res.end();
  }
}

// GET /api/chat/history?sessionId=xxx
export async function fetchHistory(req, res, next) {
  try {
    const history = await getHistory(req.query.sessionId || 'default');
    res.status(200).json({ success: true, ...history });
  } catch (err) { next(createError(err.message, err.status || 500)); }
}

// GET /api/chat/sessions
export async function fetchSessions(req, res, next) {
  try {
    const sessions = await getAllSessions();
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) { next(createError(err.message, err.status || 500)); }
}

// DELETE /api/chat/history?sessionId=xxx
export async function clearHistory(req, res, next) {
  try {
    await resetConversation(req.query.sessionId || 'default');
    res.status(200).json({ success: true, message: 'Session cleared.' });
  } catch (err) { next(createError(err.message, err.status || 500)); }
}

// DELETE /api/chat/sessions/:sessionId
export async function deleteSessionHandler(req, res, next) {
  try {
    await removeSession(req.params.sessionId);
    res.status(200).json({ success: true, message: `Session deleted.` });
  } catch (err) { next(createError(err.message, err.status || 500)); }
}
