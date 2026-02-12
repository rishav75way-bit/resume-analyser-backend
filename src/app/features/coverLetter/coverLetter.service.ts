import { generateCoverLetter } from '../../common/helpers/coverLetter';
import { GenerateCoverLetterInput } from './coverLetter.validators';
import { CoverLetter } from './coverLetter.schema';
import { Types } from 'mongoose';
import { AppError } from '../../common/middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { CONSTANTS } from '../../common/constants';

export const generateCoverLetterService = async (userId: string, input: GenerateCoverLetterInput) => {
    const jobDescription = input.jobDescription && input.jobDescription !== '' ? input.jobDescription : undefined;
    const coverLetterText = await generateCoverLetter(input.resumeText, jobDescription);

    const savedCoverLetter = await CoverLetter.create({
        userId: new Types.ObjectId(userId),
        resumeText: input.resumeText,
        jobDescription: jobDescription || '',
        coverLetter: coverLetterText,
    });

    return savedCoverLetter;
};

export const getCoverLetterHistory = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        CoverLetter.find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        CoverLetter.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
        data,
        pagination: {
            total,
            hasNextPage: page < Math.ceil(total / limit),
        },
    };
};

export const deleteCoverLetter = async (userId: string, coverLetterId: string) => {
    if (!Types.ObjectId.isValid(coverLetterId)) {
        throw new AppError(CONSTANTS.MESSAGES.COVER_LETTER.NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    const deleted = await CoverLetter.findOneAndDelete({
        _id: new Types.ObjectId(coverLetterId),
        userId: new Types.ObjectId(userId),
    }).exec();
    if (!deleted) {
        throw new AppError(CONSTANTS.MESSAGES.COVER_LETTER.NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    return { deleted: true };
};
