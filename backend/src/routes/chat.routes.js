/**
 * chat.routes.js — Chat API Routes
 */

import { Router } from 'express';
import {
  sendMessage,
  fetchHistory,
  fetchSessions,
  clearHistory,
  deleteSessionHandler,
} from '../controllers/chat.controller.js';
import { validateChatInput } from '../middlewares/validate.middleware.js';

export const chatRouter = Router();

// Send a message (optionally pass sessionId in body to use a named session)
chatRouter.post('/', validateChatInput, sendMessage);

// List all saved sessions
chatRouter.get('/sessions', fetchSessions);

// Get full message history for a session (?sessionId=xxx)
chatRouter.get('/history', fetchHistory);

// Clear messages in a session (?sessionId=xxx)
chatRouter.delete('/history', clearHistory);

// Permanently delete a session
chatRouter.delete('/sessions/:sessionId', deleteSessionHandler);
