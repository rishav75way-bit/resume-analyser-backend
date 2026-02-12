import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.config';
import { CONSTANTS } from '../constants';
import { AppError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const generateCoverLetter = async (resumeText: string, jobDescription?: string): Promise<string> => {
    const modelNames = ['models/gemini-2.5-flash', 'models/gemini-pro-latest', 'models/gemini-2.5-pro', 'models/gemini-2.0-flash'];

    const safeJobDescription = jobDescription && jobDescription.trim().length > 0 
        ? jobDescription 
        : 'a general position that matches the candidate\'s skills and experience';

    for (const modelName of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = CONSTANTS.PROMPTS.COVER_LETTER_GENERATION
                .replace('{resumeText}', resumeText)
                .replace('{jobDescription}', safeJobDescription);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            if (!text || text.length < 100) {
                throw new Error('Generated cover letter is too short or invalid');
            }

            return text;
        } catch (error) {
            if (modelNames.indexOf(modelName) === modelNames.length - 1) {
                const message = error instanceof Error ? error.message : CONSTANTS.MESSAGES.COVER_LETTER.GENERATION_FAILED;
                throw new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
            }
            continue;
        }
    }

    throw new AppError(CONSTANTS.MESSAGES.COVER_LETTER.GENERATION_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
};
