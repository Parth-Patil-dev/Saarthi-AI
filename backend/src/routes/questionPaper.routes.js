/**
 * questionPaper.routes.js — Question Paper API Routes
 */

import { Router } from 'express';
import { fetchSubjects, generatePaper } from '../controllers/questionPaper.controller.js';

export const questionPaperRouter = Router();

// GET  /api/question-paper/subjects  — list available subjects
questionPaperRouter.get('/subjects', fetchSubjects);

// POST /api/question-paper/generate  — generate a question paper
questionPaperRouter.post('/generate', generatePaper);
