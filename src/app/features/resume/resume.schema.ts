import { Schema, model, Document, Types, Model } from 'mongoose';
import { CONSTANTS } from '../../common/constants';

export interface IResumeAnalysis extends Document {
    userId: Types.ObjectId;
    resumeText: string;
    aiResult: {
        resumeScore?: number;
        scoreSummary?: string;
        strengths: string[];
        weaknesses: string[];
        improvementSuggestions: string[];
        keywordsPresent?: string[];
        keywordsMissing?: string[];
        lengthCheck?: {
            wordCount: number;
            pageEstimate: number;
            status: 'optimal' | 'too-short' | 'too-long';
            recommendation: string;
        };
        formattingIssues?: Array<{
            type: 'missing-section' | 'inconsistent-formatting' | 'poor-structure' | 'ats-unfriendly';
            severity: 'warning' | 'error';
            message: string;
            suggestion: string;
        }>;
        atsWarnings?: Array<{
            issue: string;
            severity: 'low' | 'medium' | 'high';
            recommendation: string;
        }>;
    };
    createdAt: Date;
}

const resumeAnalysisSchema: Schema<IResumeAnalysis> = new Schema<IResumeAnalysis>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: CONSTANTS.COLLECTIONS.USERS,
            required: true,
            index: true,
        },
        resumeText: {
            type: String,
            required: true,
        },
        aiResult: {
            resumeScore: { type: Number },
            scoreSummary: { type: String },
            strengths: { type: [String], required: true },
            weaknesses: { type: [String], required: true },
            improvementSuggestions: { type: [String], required: true },
            keywordsPresent: { type: [String] },
            keywordsMissing: { type: [String] },
            lengthCheck: {
                wordCount: { type: Number },
                pageEstimate: { type: Number },
                status: { type: String, enum: ['optimal', 'too-short', 'too-long'] },
                recommendation: { type: String },
            },
            formattingIssues: [{
                type: { type: String, enum: ['missing-section', 'inconsistent-formatting', 'poor-structure', 'ats-unfriendly'] },
                severity: { type: String, enum: ['warning', 'error'] },
                message: { type: String },
                suggestion: { type: String },
            }],
            atsWarnings: [{
                issue: { type: String },
                severity: { type: String, enum: ['low', 'medium', 'high'] },
                recommendation: { type: String },
            }],
        },
    },
    {
        timestamps: true,
        collection: CONSTANTS.COLLECTIONS.RESUME_ANALYSIS,
    }
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ResumeAnalysis: Model<IResumeAnalysis> = model<IResumeAnalysis>(
    CONSTANTS.COLLECTIONS.RESUME_ANALYSIS,
    resumeAnalysisSchema
);
