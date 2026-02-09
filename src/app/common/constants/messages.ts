export const MESSAGES = {
    AUTH: {
        USER_NOT_FOUND: 'User not found',
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_REGISTERED: 'Email already registered',
        REGISTER_SUCCESS: 'User registered successfully',
        LOGIN_SUCCESS: 'User logged in successfully',
        NOT_AUTHORIZED: 'Not authorized to access this route',
        USER_DELETED: 'The user belonging to this token no longer exists',
        INVALID_TOKEN: 'Invalid token, please log in again',
        RATE_LIMIT_AUTH: 'Too many requests from this IP, please try again after 15 minutes',
    },
    RESUME: {
        ANALYZE_SUCCESS: 'Resume analyzed successfully',
        RATE_LIMIT_AI: 'AI analysis limit reached for this hour, please try again later',
        RESUME_ANALYSIS_FAILED: 'Failed to analyze resume with AI',
        PDF_EXTRACTION_FAILED: 'Failed to extract text from PDF. Please ensure the PDF contains readable text.',
        INVALID_FILE_TYPE: 'Invalid file type. Only PDF files are allowed.',
        FILE_TOO_LARGE: 'File size exceeds the maximum allowed size of 5MB.',
        NO_FILE_UPLOADED: 'No file uploaded.',
    },
    COMMON: {
        ROUTE_NOT_FOUND: 'Route not found',
        SERVER_RUNNING: 'AI Powered Resume Analyser API is running',
        SOMETHING_WENT_WRONG: 'Something went wrong',
    },
};
