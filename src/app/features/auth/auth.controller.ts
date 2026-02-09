import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../common/helpers/asyncHandler';
import * as authService from './auth.service';
import { CONSTANTS } from '../../common/constants';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: CONSTANTS.MESSAGES.AUTH.REGISTER_SUCCESS,
        data: result,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.status(StatusCodes.OK).json({
        success: true,
        message: CONSTANTS.MESSAGES.AUTH.LOGIN_SUCCESS,
        data: result,
    });
});
