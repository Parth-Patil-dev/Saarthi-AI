import { Router } from 'express';
import {
  submitAnswers, listResults, fetchResult,
  fetchAdvice, fetchStudentResults, listStats, fetchStudentStats,
} from '../controllers/grading.controller.js';
import { getTrend } from '../controllers/trend.controller.js';
import { answerUpload } from '../middlewares/answerUpload.middleware.js';

export const gradingRouter = Router();

gradingRouter.post('/submit',                    answerUpload.single('file'), submitAnswers);
gradingRouter.get('/results',                    listResults);
gradingRouter.get('/results/:resultId',          fetchResult);
gradingRouter.get('/results/:resultId/advice',   fetchAdvice);
gradingRouter.get('/results/student/:studentId', fetchStudentResults);
gradingRouter.get('/stats',                      listStats);
gradingRouter.get('/stats/:studentId/trend',     getTrend);          // ← before /stats/:studentId
gradingRouter.get('/stats/:studentId',           fetchStudentStats);
