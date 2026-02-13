import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../common/helpers/asyncHandler';
import * as resumeService from './resume.service';
import { CONSTANTS } from '../../common/constants';
import { AuthRequest } from '../../common/middlewares/authMiddleware';
import { AppError } from '../../common/middlewares/errorHandler';
import { resumeChatSchema } from './resume.validators';

export const analyzeResume = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const result = await resumeService.analyzeResume(req.user._id.toString(), req.body);

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: CONSTANTS.MESSAGES.RESUME.ANALYZE_SUCCESS,
        data: result,
    });
});

export const analyzeResumeFromPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    if (!req.file || !req.file.buffer) {
        throw new AppError(CONSTANTS.MESSAGES.RESUME.NO_FILE_UPLOADED, StatusCodes.BAD_REQUEST);
    }

    const jobDescription = typeof req.body?.jobDescription === 'string' ? req.body.jobDescription : undefined;

    const result = await resumeService.analyzeResumeFromPDF(
        req.user._id.toString(),
        req.file.buffer,
        jobDescription
    );

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: CONSTANTS.MESSAGES.RESUME.ANALYZE_SUCCESS,
        data: result,
    });
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;

    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 6;

    const result = await resumeService.getAnalysisHistory(req.user._id.toString(), validPage, validLimit);

    res.status(StatusCodes.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

export const getAnalysisById = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }
    const rawId = req.params.id;
    const analysisId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] ?? '' : '';
    const result = await resumeService.getAnalysisById(req.user._id.toString(), analysisId);
    res.status(StatusCodes.OK).json({
        success: true,
        data: result,
    });
});

export const deleteAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }
    const rawId = req.params.id;
    const analysisId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] ?? '' : '';
    const result = await resumeService.deleteAnalysis(req.user._id.toString(), analysisId);
    res.status(StatusCodes.OK).json({
        success: true,
        message: CONSTANTS.MESSAGES.RESUME.DELETE_SUCCESS,
        data: result,
    });
});

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const result = await resumeService.getAnalytics(req.user._id.toString());

    res.status(StatusCodes.OK).json({
        success: true,
        data: result,
    });
});

export const chatResume = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED);
    }

    const result = await resumeService.chatWithResume(req.body.resumeText, req.body.question);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Chat response generated successfully',
        data: result,
    });
});
