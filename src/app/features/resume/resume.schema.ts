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
