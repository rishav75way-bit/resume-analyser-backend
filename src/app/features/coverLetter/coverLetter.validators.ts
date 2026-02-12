import { z } from 'zod';

export const generateCoverLetterSchema = z.object({
    resumeText: z.string().min(50, 'Resume text must be at least 50 characters long'),
    jobDescription: z
        .union([z.string().min(50, 'Job description must be at least 50 characters long'), z.literal('')])
        .optional()
        .default(''),
});

export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>;
