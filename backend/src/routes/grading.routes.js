/**
 * grading.routes.js — Answer Submission & Stats Routes
 */

import { Router } from 'express';
import {
  submitAnswers,
  listResults,
  fetchResult,
  fetchAdvice,
  fetchStudentResults,
  listStats,
  fetchStudentStats,
} from '../controllers/grading.controller.js';
import { answerUpload } from '../middlewares/answerUpload.middleware.js';

export const gradingRouter = Router();

// Submit answers — accepts image OR pdf OR plain JSON
gradingRouter.post('/submit', answerUpload.single('file'), submitAnswers);

// Results — supports ?subject= ?chapter= ?search= ?studentId= filtering
gradingRouter.get('/results', listResults);

// Single result
gradingRouter.get('/results/:resultId', fetchResult);

// AI advice for a result (lazy generated + cached)
gradingRouter.get('/results/:resultId/advice', fetchAdvice);

// All results for a specific student
gradingRouter.get('/results/student/:studentId', fetchStudentResults);

// All students stats
gradingRouter.get('/stats', listStats);

// One student's stats
gradingRouter.get('/stats/:studentId', fetchStudentStats);
