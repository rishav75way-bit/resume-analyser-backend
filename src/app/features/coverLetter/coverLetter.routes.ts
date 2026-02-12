import { Router } from 'express';
import * as coverLetterController from './coverLetter.controller';
import { protect } from '../../common/middlewares/authMiddleware';
import { aiRateLimiter } from '../../common/middlewares/rateLimiter';
import { validate } from '../../common/middlewares/validate';
import { generateCoverLetterSchema } from './coverLetter.validators';

const coverLetterRouter = Router();

coverLetterRouter.use(protect);

coverLetterRouter.post('/generate', aiRateLimiter, validate(generateCoverLetterSchema), coverLetterController.generateCoverLetter);
coverLetterRouter.get('/history', aiRateLimiter, coverLetterController.getHistory);
coverLetterRouter.delete('/history/:id', aiRateLimiter, coverLetterController.deleteCoverLetter);

export { coverLetterRouter };
