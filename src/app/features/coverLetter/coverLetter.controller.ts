import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../common/helpers/asyncHandler';
import * as coverLetterService from './coverLetter.service';
import { CONSTANTS } from '../../common/constants';
import { AuthRequest } from '../../common/middlewares/authMiddleware';
import { AppError } from '../../common/middlewares/errorHandler';

export const generateCoverLetter = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const result = await coverLetterService.generateCoverLetterService(req.user._id.toString(), req.body);

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: CONSTANTS.MESSAGES.COVER_LETTER.GENERATION_SUCCESS,
        data: result,
    });
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 10;

    const result = await coverLetterService.getCoverLetterHistory(req.user._id.toString(), validPage, validLimit);

    res.status(StatusCodes.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

export const deleteCoverLetter = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }
    const rawId = req.params.id;
    const coverLetterId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] ?? '' : '';
    
    try {
        await coverLetterService.deleteCoverLetter(req.user._id.toString(), coverLetterId);
        res.status(StatusCodes.OK).json({
            success: true,
            message: CONSTANTS.MESSAGES.COVER_LETTER.DELETE_SUCCESS,
        });
    } catch (error) {
        throw new AppError(
            error instanceof Error ? error.message : CONSTANTS.MESSAGES.COVER_LETTER.NOT_FOUND,
            StatusCodes.NOT_FOUND
        );
    }
});
