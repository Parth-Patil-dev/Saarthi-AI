/**
 * questionPaper.routes.js — Question Paper API Routes
 */

import { Router } from 'express';
import { fetchSubjects, generatePaper, listPapersHandler, getPaperHandler } from '../controllers/questionPaper.controller.js';

export const questionPaperRouter = Router();

// GET  /api/question-paper/subjects
questionPaperRouter.get('/subjects', fetchSubjects);

// GET  /api/question-paper — list all saved papers
questionPaperRouter.get('/', listPapersHandler);

// GET  /api/question-paper/:paperId — get one paper
questionPaperRouter.get('/:paperId', getPaperHandler);

// POST /api/question-paper/generate
questionPaperRouter.post('/generate', generatePaper);
