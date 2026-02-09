import { z } from 'zod';

export const analyzeResumeSchema = z.object({
    resumeText: z.string().min(50, 'Resume text must be at least 50 characters long'),
    jobDescription: z
        .union([z.string().min(50, 'Job description must be at least 50 characters long'), z.literal('')])
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});

export const aiResultValidationSchema = z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvementSuggestions: z.array(z.string()),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type AIResult = z.infer<typeof aiResultValidationSchema>;
