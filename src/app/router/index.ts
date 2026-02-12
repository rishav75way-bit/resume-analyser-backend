import { Router } from 'express';
import { authRouter } from '../features/auth/auth.routes';
import { resumeRouter } from '../features/resume/resume.routes';
import { coverLetterRouter } from '../features/coverLetter/coverLetter.routes';

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/resume', resumeRouter);
rootRouter.use('/cover-letter', coverLetterRouter);

export { rootRouter };
