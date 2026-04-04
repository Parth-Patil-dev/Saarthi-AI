/**
 * server.js — Application Entry Point
 */

import 'dotenv/config';
import express from 'express';
import { chatRouter } from './src/routes/chat.routes.js';
import { pdfRouter } from './src/routes/pdf.routes.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { requestLogger } from './src/middlewares/logger.middleware.js';
import { notFound } from './src/middlewares/notFound.middleware.js';
import { initChatService } from './src/services/chat.service.js';
import { initPdfService } from './src/services/pdf.service.js';
import { questionPaperRouter } from './src/routes/questionPaper.routes.js';
import { notesRouter } from './src/routes/notes.routes.js';
import { gradingRouter } from './src/routes/grading.routes.js';
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    model:     process.env.AI_MODEL_NAME || 'mock',
    mode:      process.env.AI_MODE || 'mock',
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/chat', chatRouter);
app.use('/api', pdfRouter);
app.use('/api/question-paper', questionPaperRouter);
app.use('/api/notes', notesRouter);
app.use('/api/grading', gradingRouter);

// ── Error Handling (must be LAST) ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Bootstrap & Start ──────────────────────────────────────────────────────────
async function start() {
  // Load persisted data before accepting requests
  await initPdfService();
  await initChatService();

  app.listen(PORT, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────┐');
    console.log(`│  🚀 Server running on port ${PORT}          │`);
    console.log(`│  📦 Mode:  ${(process.env.AI_MODE || 'mock').padEnd(29)}│`);
    console.log(`│  🤖 Model: ${(process.env.AI_MODEL_NAME || 'N/A').padEnd(29)}│`);
    console.log(`│  💾 Data:  ${(process.env.DATA_DIR || 'data/').padEnd(29)}│`);
    console.log('└─────────────────────────────────────────┘');
    console.log('');
  });
}

start();

export default app;
