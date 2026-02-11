import { z } from 'zod';

export const analyzeResumeSchema = z.object({
    resumeText: z.string().min(50, 'Resume text must be at least 50 characters long'),
    jobDescription: z
        .union([z.string().min(50, 'Job description must be at least 50 characters long'), z.literal('')])
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});

const resumeLengthCheckSchema = z.object({
    wordCount: z.number(),
    pageEstimate: z.number(),
    status: z.enum(['optimal', 'too-short', 'too-long']),
    recommendation: z.string(),
});

const formattingIssueSchema = z.object({
    type: z.enum(['missing-section', 'inconsistent-formatting', 'poor-structure', 'ats-unfriendly']),
    severity: z.enum(['warning', 'error']),
    message: z.string(),
    suggestion: z.string(),
});

const atsWarningSchema = z.object({
    issue: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    recommendation: z.string(),
});

export const aiResultValidationSchema = z.object({
    resumeScore: z.number().min(0).max(10).optional().default(0),
    scoreSummary: z.string().optional().default(''),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvementSuggestions: z.array(z.string()),
    keywordsPresent: z.array(z.string()).optional().default([]),
    keywordsMissing: z.array(z.string()).optional().default([]),
    lengthCheck: resumeLengthCheckSchema.optional(),
    formattingIssues: z.array(formattingIssueSchema).optional().default([]),
    atsWarnings: z.array(atsWarningSchema).optional().default([]),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type AIResult = z.infer<typeof aiResultValidationSchema>;
