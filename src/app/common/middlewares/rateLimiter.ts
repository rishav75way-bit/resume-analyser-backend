import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../constants';

export const authRateLimiter = rateLimit({
    windowMs: 900000,
    max: 10,
    message: {
        success: false,
        message: CONSTANTS.MESSAGES.AUTH.RATE_LIMIT_AUTH,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
    windowMs: 3600000,
    max: 20,
    message: {
        success: false,
        message: CONSTANTS.MESSAGES.RESUME.RATE_LIMIT_AI,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
