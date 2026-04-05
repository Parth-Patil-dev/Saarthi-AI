import { Router } from 'express';
import {
  sendMessage, streamMessage, fetchHistory,
  fetchSessions, clearHistory, deleteSessionHandler,
} from '../controllers/chat.controller.js';
import { validateChatInput } from '../middlewares/validate.middleware.js';

export const chatRouter = Router();

chatRouter.post('/',                    validateChatInput, sendMessage);
chatRouter.post('/stream',              validateChatInput, streamMessage);
chatRouter.get('/sessions',             fetchSessions);
chatRouter.get('/history',              fetchHistory);
chatRouter.delete('/history',           clearHistory);
chatRouter.delete('/sessions/:sessionId', deleteSessionHandler);
