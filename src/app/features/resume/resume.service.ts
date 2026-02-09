import { ResumeAnalysis } from './resume.schema';
import { AnalyzeResumeInput } from './resume.validators';
import { analyzeResumeWithAI } from '../../common/helpers/ai';
import { extractTextFromPDF } from '../../common/helpers/pdfExtractor';
import { Types } from 'mongoose';

export const analyzeResume = async (userId: string, input: AnalyzeResumeInput) => {
    const aiResult = await analyzeResumeWithAI(input.resumeText, input.jobDescription);

    const analysis = await ResumeAnalysis.create({
        userId: new Types.ObjectId(userId),
        resumeText: input.resumeText,
        aiResult,
    });

    return analysis;
};

export const analyzeResumeFromPDF = async (userId: string, fileBuffer: Buffer, jobDescription?: string) => {
    const resumeText = await extractTextFromPDF(fileBuffer);
    return analyzeResume(userId, { resumeText, jobDescription });
};

export const getAnalysisHistory = async (userId: string, page: number = 1, limit: number = 6) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        ResumeAnalysis.find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        ResumeAnalysis.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
        data,
        pagination: {
            total,
            hasNextPage: page < Math.ceil(total / limit),
        },
    };
};
