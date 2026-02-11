import { ResumeAnalysis } from './resume.schema';
import { AnalyzeResumeInput } from './resume.validators';
import { analyzeResumeWithAI } from '../../common/helpers/ai';
import { extractTextFromPDF } from '../../common/helpers/pdfExtractor';
import { analyzeResumeChecks } from '../../common/helpers/resumeChecker';
import { Types } from 'mongoose';
import { AppError } from '../../common/middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { CONSTANTS } from '../../common/constants';

export const analyzeResume = async (userId: string, input: AnalyzeResumeInput) => {
    const aiResult = await analyzeResumeWithAI(input.resumeText, input.jobDescription);
    const checks = analyzeResumeChecks(input.resumeText);

    const analysis = await ResumeAnalysis.create({
        userId: new Types.ObjectId(userId),
        resumeText: input.resumeText,
        aiResult: {
            ...aiResult,
            lengthCheck: checks.length,
            formattingIssues: checks.formattingIssues,
            atsWarnings: checks.atsWarnings,
        },
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

export const deleteAnalysis = async (userId: string, analysisId: string) => {
    if (!Types.ObjectId.isValid(analysisId)) {
        throw new AppError(CONSTANTS.MESSAGES.RESUME.ANALYSIS_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    const deleted = await ResumeAnalysis.findOneAndDelete({
        _id: new Types.ObjectId(analysisId),
        userId: new Types.ObjectId(userId),
    }).exec();
    if (!deleted) {
        throw new AppError(CONSTANTS.MESSAGES.RESUME.ANALYSIS_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    return { deleted: true };
};

export const getAnalytics = async (userId: string) => {
    const analyses = await ResumeAnalysis.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: 1 })
        .exec();

    const scoreTrends = analyses
        .filter((a) => typeof a.aiResult.resumeScore === 'number')
        .map((a) => ({
            date: a.createdAt.toISOString().split('T')[0],
            score: a.aiResult.resumeScore as number,
        }));

    const keywordUsage: Record<string, number> = {};
    analyses.forEach((analysis) => {
        const keywords = analysis.aiResult.keywordsPresent || [];
        keywords.forEach((keyword) => {
            keywordUsage[keyword] = (keywordUsage[keyword] || 0) + 1;
        });
    });

    const keywordTrends = Object.entries(keywordUsage)
        .map(([keyword, count]) => ({
            keyword,
            count,
            percentage: Math.round((count / analyses.length) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const averageScore = scoreTrends.length > 0
        ? Math.round((scoreTrends.reduce((sum, item) => sum + item.score, 0) / scoreTrends.length) * 10) / 10
        : 0;

    const latestScore = scoreTrends.length > 0 ? scoreTrends[scoreTrends.length - 1].score : 0;
    const firstScore = scoreTrends.length > 0 ? scoreTrends[0].score : 0;
    const scoreImprovement = latestScore - firstScore;

    const totalAnalyses = analyses.length;
    const totalKeywords = Object.keys(keywordUsage).length;

    return {
        scoreTrends,
        keywordTrends,
        metrics: {
            averageScore,
            latestScore,
            scoreImprovement,
            totalAnalyses,
            totalKeywords,
        },
    };
};
