import { Router } from 'express';
import {
	generateMCQHandler,
	submitMCQResult,
	listSavedMCQPapers,
	getSavedMCQPaper,
} from '../controllers/mcq.controller.js';

export const mcqRouter = Router();

// Generate MCQ paper + save it
mcqRouter.post('/generate', generateMCQHandler);

// List and retrieve saved MCQ papers
mcqRouter.get('/papers', listSavedMCQPapers);
mcqRouter.get('/papers/:paperId', getSavedMCQPaper);

// Submit completed MCQ → goes into grading stats
mcqRouter.post('/submit', submitMCQResult);
