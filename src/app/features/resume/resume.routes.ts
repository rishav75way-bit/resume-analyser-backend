import { Router } from 'express';
import * as resumeController from './resume.controller';
import { protect } from '../../common/middlewares/authMiddleware';
import { aiRateLimiter } from '../../common/middlewares/rateLimiter';
import { validate } from '../../common/middlewares/validate';
import { uploadPDF } from '../../common/middlewares/uploadMiddleware';
import { analyzeResumeSchema } from './resume.validators';

const resumeRouter = Router();

resumeRouter.use(protect);

resumeRouter.post('/analyze', aiRateLimiter, validate(analyzeResumeSchema), resumeController.analyzeResume);
resumeRouter.post('/analyze/upload', aiRateLimiter, uploadPDF.single('file'), resumeController.analyzeResumeFromPDF);
resumeRouter.get('/history', aiRateLimiter, resumeController.getHistory);
resumeRouter.delete('/history/:id', aiRateLimiter, resumeController.deleteAnalysis);

export { resumeRouter };
