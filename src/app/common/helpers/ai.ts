import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.config';
import { CONSTANTS } from '../constants';
import { AIResult, aiResultValidationSchema } from '../../features/resume/resume.validators';
import { AppError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const analyzeResumeWithAI = async (resumeText: string, jobDescription?: string): Promise<AIResult> => {
    const modelNames = ['models/gemini-2.5-flash', 'models/gemini-pro-latest', 'models/gemini-2.5-pro', 'models/gemini-2.0-flash'];

    const safeJobDescription = jobDescription ?? '';

    for (const modelName of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = CONSTANTS.PROMPTS.RESUME_ANALYSIS
                .replace('{resumeText}', resumeText)
                .replace('{jobDescription}', safeJobDescription);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('AI response was not in expected JSON format');
            }

            const json: unknown = JSON.parse(jsonMatch[0]);

            const validation = aiResultValidationSchema.safeParse(json);
            if (!validation.success) {
                throw new AppError(CONSTANTS.MESSAGES.RESUME.RESUME_ANALYSIS_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
            }

            return validation.data;
        } catch (error) {
            if (modelNames.indexOf(modelName) === modelNames.length - 1) {
                const message = error instanceof Error ? error.message : CONSTANTS.MESSAGES.RESUME.RESUME_ANALYSIS_FAILED;
                throw new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
            }
            continue;
        }
    }

    throw new AppError(CONSTANTS.MESSAGES.RESUME.RESUME_ANALYSIS_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
};
