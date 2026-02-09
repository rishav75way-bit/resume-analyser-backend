import { PDFParse } from 'pdf-parse';
import { AppError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { CONSTANTS } from '../constants';

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
    if (!buffer || buffer.length === 0) {
        throw new AppError(
            CONSTANTS.MESSAGES.RESUME.PDF_EXTRACTION_FAILED,
            StatusCodes.BAD_REQUEST
        );
    }

    try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        
        await parser.destroy();
        
        if (!result || typeof result.text !== 'string') {
            throw new AppError(
                CONSTANTS.MESSAGES.RESUME.PDF_EXTRACTION_FAILED,
                StatusCodes.BAD_REQUEST
            );
        }

        const text = result.text.trim();

        if (!text || text.length < 50) {
            throw new AppError(
                `PDF extraction resulted in ${text.length} characters. ${CONSTANTS.MESSAGES.RESUME.PDF_EXTRACTION_FAILED}`,
                StatusCodes.BAD_REQUEST
            );
        }

        return text;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new AppError(
            `${CONSTANTS.MESSAGES.RESUME.PDF_EXTRACTION_FAILED} Error: ${errorMessage}`,
            StatusCodes.BAD_REQUEST
        );
    }
};
