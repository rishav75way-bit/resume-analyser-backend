interface ResumeLengthCheck {
    wordCount: number;
    pageEstimate: number;
    status: 'optimal' | 'too-short' | 'too-long';
    recommendation: string;
}

interface FormattingIssue {
    type: 'missing-section' | 'inconsistent-formatting' | 'poor-structure' | 'ats-unfriendly';
    severity: 'warning' | 'error';
    message: string;
    suggestion: string;
}

interface ATSCompatibilityWarning {
    issue: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
}

interface ResumeAnalysisChecks {
    length: ResumeLengthCheck;
    formattingIssues: FormattingIssue[];
    atsWarnings: ATSCompatibilityWarning[];
}

const OPTIMAL_WORD_COUNT_MIN = 400;
const OPTIMAL_WORD_COUNT_MAX = 800;
const WORDS_PER_PAGE = 250;

const COMMON_SECTIONS = ['experience', 'education', 'skills', 'summary', 'objective', 'contact', 'work', 'employment'];

export const checkResumeLength = (resumeText: string): ResumeLengthCheck => {
    const words = resumeText.trim().split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const pageEstimate = Math.ceil(wordCount / WORDS_PER_PAGE);

    let status: 'optimal' | 'too-short' | 'too-long';
    let recommendation: string;

    if (wordCount < OPTIMAL_WORD_COUNT_MIN) {
        status = 'too-short';
        recommendation = `Your resume is ${wordCount} words. Consider adding more details about your experience, skills, and achievements. Aim for 400-800 words for optimal ATS compatibility.`;
    } else if (wordCount > OPTIMAL_WORD_COUNT_MAX) {
        status = 'too-long';
        recommendation = `Your resume is ${wordCount} words (approximately ${pageEstimate} pages). For most positions, keep it to 1-2 pages. Consider removing less relevant information or condensing descriptions.`;
    } else {
        status = 'optimal';
        recommendation = `Your resume length is optimal at ${wordCount} words (approximately ${pageEstimate} page${pageEstimate > 1 ? 's' : ''}). This length works well for ATS systems.`;
    }

    return {
        wordCount,
        pageEstimate,
        status,
        recommendation,
    };
};

export const detectFormattingIssues = (resumeText: string): FormattingIssue[] => {
    const issues: FormattingIssue[] = [];
    const lowerText = resumeText.toLowerCase();

    const hasCommonSections = COMMON_SECTIONS.some((section) => lowerText.includes(section));

    if (!hasCommonSections) {
        issues.push({
            type: 'missing-section',
            severity: 'error',
            message: 'Resume appears to be missing standard sections',
            suggestion: 'Ensure your resume includes sections like Experience, Education, Skills, and Summary/Objective.',
        });
    }

    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    if (!emailPattern.test(resumeText)) {
        issues.push({
            type: 'missing-section',
            severity: 'warning',
            message: 'Contact information may be missing',
            suggestion: 'Make sure your resume includes your email address and phone number.',
        });
    }

    const hasBulletPoints = /[•\-\*]\s|\d+\.\s/.test(resumeText);
    if (!hasBulletPoints) {
        issues.push({
            type: 'poor-structure',
            severity: 'warning',
            message: 'Consider using bullet points for better readability',
            suggestion: 'Use bullet points to list achievements and responsibilities. This improves ATS parsing and readability.',
        });
    }

    const hasDates = /\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}\b/i.test(resumeText);
    if (!hasDates) {
        issues.push({
            type: 'inconsistent-formatting',
            severity: 'warning',
            message: 'Dates may be missing from experience/education',
            suggestion: 'Include dates for all work experience and education entries to show your career progression.',
        });
    }

    return issues;
};

export const checkATSCompatibility = (resumeText: string): ATSCompatibilityWarning[] => {
    const warnings: ATSCompatibilityWarning[] = [];

    const hasSpecialChars = /[^\w\s\-.,;:!?()@\/]/.test(resumeText);
    if (hasSpecialChars) {
        warnings.push({
            issue: 'Unusual special characters detected',
            severity: 'medium',
            recommendation: 'Avoid decorative characters, symbols, or special formatting that ATS systems may not parse correctly. Stick to standard punctuation.',
        });
    }

    const hasTables = /<table|<tr|<td/i.test(resumeText);
    if (hasTables) {
        warnings.push({
            issue: 'Tables detected in resume',
            severity: 'high',
            recommendation: 'Tables can cause parsing issues in ATS systems. Use standard formatting with sections and bullet points instead.',
        });
    }

    const hasHeadersFooters = /header|footer|page \d+/i.test(resumeText);
    if (hasHeadersFooters) {
        warnings.push({
            issue: 'Headers or footers detected',
            severity: 'medium',
            recommendation: 'Headers and footers may not be parsed correctly by ATS systems. Keep important information in the main body of the resume.',
        });
    }

    const wordCount = resumeText.trim().split(/\s+/).length;
    if (wordCount > 1200) {
        warnings.push({
            issue: 'Resume is very long',
            severity: 'medium',
            recommendation: 'Very long resumes (over 3 pages) may be truncated or not fully parsed by some ATS systems. Consider condensing to 1-2 pages.',
        });
    }

    const hasKeywords = resumeText.match(/\b(javascript|python|java|react|node|sql|aws|docker|kubernetes|agile|scrum)\b/gi);
    if (!hasKeywords || hasKeywords.length < 3) {
        warnings.push({
            issue: 'Limited technical keywords detected',
            severity: 'low',
            recommendation: 'Include relevant technical skills and keywords from the job description to improve ATS matching.',
        });
    }

    return warnings;
};

export const analyzeResumeChecks = (resumeText: string): ResumeAnalysisChecks => {
    return {
        length: checkResumeLength(resumeText),
        formattingIssues: detectFormattingIssues(resumeText),
        atsWarnings: checkATSCompatibility(resumeText),
    };
};
