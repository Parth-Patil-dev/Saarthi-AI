/**
 * grading.routes.js — Answer Submission & Stats Routes
 */

import { Router } from 'express';
import {
  submitAnswers,
  listResults,
  fetchResult,
  fetchStudentResults,
  listStats,
  fetchStudentStats,
} from '../controllers/grading.controller.js';
import { pdfUpload } from '../middlewares/upload.middleware.js';

export const gradingRouter = Router();

// Submit answers for grading (JSON or multipart with optional PDF)
gradingRouter.post('/submit', pdfUpload.single('file'), submitAnswers);

// All results
gradingRouter.get('/results', listResults);

// Single result
gradingRouter.get('/results/:resultId', fetchResult);

// All results for a student
gradingRouter.get('/results/student/:studentId', fetchStudentResults);

// All students stats
gradingRouter.get('/stats', listStats);

// One student's stats
gradingRouter.get('/stats/:studentId', fetchStudentStats);
