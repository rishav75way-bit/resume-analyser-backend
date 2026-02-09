import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { CONSTANTS } from '../constants';
import { z } from 'zod';

const tokenPayloadSchema = z.object({
    id: z.string(),
});

export const generateToken = (payload: { id: string }): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: CONSTANTS.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
};

export const verifyToken = (token: string): { id: string } => {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return tokenPayloadSchema.parse(decoded);
};
