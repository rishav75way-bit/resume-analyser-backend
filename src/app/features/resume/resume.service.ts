import { ResumeAnalysis } from './resume.schema';
import { AnalyzeResumeInput, ResumeChatInput } from './resume.validators';
import { analyzeResumeWithAI, getGrammarAndToneFeedback, chatAboutResume } from '../../common/helpers/ai';
import { extractTextFromPDF } from '../../common/helpers/pdfExtractor';
import { analyzeResumeChecks } from '../../common/helpers/resumeChecker';
import { Types } from 'mongoose';
import { AppError } from '../../common/middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { CONSTANTS } from '../../common/constants';

export const analyzeResume = async (userId: string, input: AnalyzeResumeInput) => {
    const [aiResult, checks, grammarAndTone] = await Promise.all([
        analyzeResumeWithAI(input.resumeText, input.jobDescription),
        Promise.resolve(analyzeResumeChecks(input.resumeText)),
        getGrammarAndToneFeedback(input.resumeText),
    ]);

    const analysis = await ResumeAnalysis.create({
        userId: new Types.ObjectId(userId),
        resumeText: input.resumeText,
        aiResult: {
            ...aiResult,
            lengthCheck: checks.length,
            formattingIssues: checks.formattingIssues,
            atsWarnings: checks.atsWarnings,
            ...(grammarAndTone && { grammarAndTone }),
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

export const getAnalysisById = async (userId: string, analysisId: string) => {
    if (!Types.ObjectId.isValid(analysisId)) {
        throw new AppError(CONSTANTS.MESSAGES.RESUME.ANALYSIS_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    const analysis = await ResumeAnalysis.findOne({
        _id: new Types.ObjectId(analysisId),
        userId: new Types.ObjectId(userId),
    }).exec();
    if (!analysis) {
        throw new AppError(CONSTANTS.MESSAGES.RESUME.ANALYSIS_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    return analysis;
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
        if (keywords.length > 0) {
            keywords.forEach((keyword) => {
                keywordUsage[keyword] = (keywordUsage[keyword] || 0) + 1;
            });
        } else {
            const resumeText = analysis.resumeText.toLowerCase();
            const commonTechKeywords = [
                'javascript', 'typescript', 'python', 'java', 'react', 'node', 'angular', 'vue',
                'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
                'git', 'github', 'agile', 'scrum', 'ci/cd', 'rest', 'api', 'graphql',
                'html', 'css', 'sass', 'tailwind', 'bootstrap', 'redux', 'express',
                'machine learning', 'ai', 'data science', 'analytics', 'testing', 'jest',
                'microservices', 'serverless', 'terraform', 'jenkins', 'linux', 'unix'
            ];
            commonTechKeywords.forEach((keyword) => {
                if (resumeText.includes(keyword.toLowerCase())) {
                    keywordUsage[keyword] = (keywordUsage[keyword] || 0) + 1;
                }
            });
        }
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

export const chatWithResume = async (resumeText: string, question: string): Promise<{ answer: string; updatedResume?: string }> => {
    const answer = await chatAboutResume(resumeText, question);
    
    const isUpdateRequest = question.toLowerCase().includes('implement') || 
                           question.toLowerCase().includes('update') || 
                           question.toLowerCase().includes('apply') ||
                           question.toLowerCase().includes('change') ||
                           question.toLowerCase().includes('modify');
    
    if (isUpdateRequest) {
        const updatePrompt = `Based on the user's request, provide the complete updated resume text. Original resume: ${resumeText}. User request: ${question}. Return ONLY the complete updated resume text, nothing else.`;
        try {
            const updatedResume = await chatAboutResume(resumeText, updatePrompt);
            return { answer, updatedResume: updatedResume.trim() };
        } catch {
            return { answer };
        }
    }
    
    return { answer };
};
