import { Schema, model, Document, Types, Model } from 'mongoose';
import { CONSTANTS } from '../../common/constants';

export interface ICoverLetter extends Document {
    userId: Types.ObjectId;
    resumeText: string;
    jobDescription?: string;
    coverLetter: string;
    createdAt: Date;
}

const coverLetterSchema: Schema<ICoverLetter> = new Schema<ICoverLetter>(
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
        jobDescription: {
            type: String,
            required: false,
            default: '',
        },
        coverLetter: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: CONSTANTS.COLLECTIONS.COVER_LETTER,
    }
);

coverLetterSchema.index({ userId: 1, createdAt: -1 });

export const CoverLetter: Model<ICoverLetter> = model<ICoverLetter>(
    CONSTANTS.COLLECTIONS.COVER_LETTER,
    coverLetterSchema
);
