import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './errorHandler';
import { verifyToken } from '../helpers/token';
import { User, IUser } from '../../features/auth/auth.schema';
import { asyncHandler } from '../helpers/asyncHandler';
import { CONSTANTS } from '../constants';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError(CONSTANTS.MESSAGES.AUTH.NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
        return next(new AppError(CONSTANTS.MESSAGES.AUTH.USER_DELETED, StatusCodes.UNAUTHORIZED));
    }

    (req as AuthRequest).user = user;
    next();
});
