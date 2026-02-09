import { Router } from 'express';
import * as authController from './auth.controller';
import { authRateLimiter } from '../../common/middlewares/rateLimiter';
import { validate } from '../../common/middlewares/validate';
import { registerSchema, loginSchema } from './auth.validators';

const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);

export { authRouter };
