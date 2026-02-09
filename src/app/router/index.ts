import { Router } from 'express';
import { authRouter } from '../features/auth/auth.routes';
import { resumeRouter } from '../features/resume/resume.routes';

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/resume', resumeRouter);

export { rootRouter };
