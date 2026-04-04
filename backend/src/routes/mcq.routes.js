import { Router } from 'express';
import { generateMCQHandler, submitMCQResult } from '../controllers/mcq.controller.js';

export const mcqRouter = Router();

// Generate MCQ paper + save it
mcqRouter.post('/generate', generateMCQHandler);

// Submit completed MCQ → goes into grading stats
mcqRouter.post('/submit', submitMCQResult);
