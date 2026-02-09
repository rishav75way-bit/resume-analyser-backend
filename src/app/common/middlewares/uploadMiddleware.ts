import multer from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler';
import { StatusCodes } from 'http-status-codes';
import { CONSTANTS } from '../constants';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError(CONSTANTS.MESSAGES.RESUME.INVALID_FILE_TYPE, StatusCodes.BAD_REQUEST));
    }
};

export const uploadPDF = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: CONSTANTS.MAX_FILE_SIZE,
    },
});
