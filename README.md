# ResumeAI Backend

RESTful API backend for AI-powered resume analysis built with Node.js, Express, MongoDB, and TypeScript.

## Tech Stack

- Node.js, Express, MongoDB (Mongoose)
- TypeScript
- Google Gemini API
- JWT Authentication
- Zod Validation

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB database
- Google Gemini API key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── src/
│   └── app/
│       ├── common/             # Shared utilities
│       │   ├── config/         # Database & environment config
│       │   ├── constants/     # Centralized constants
│       │   ├── helpers/       # Helper functions (AI, PDF, etc.)
│       │   └── middlewares/   # Custom middlewares
│       ├── features/           # Feature-based modules
│       │   ├── auth/          # Authentication feature
│       │   └── resume/        # Resume analysis feature
│       ├── router/            # Main router configuration
│       └── server.ts          # Express app setup
├── dist/                      # Compiled JavaScript
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Resume Analysis (Protected - Requires JWT Token)

- `POST /api/resume/analyze` - Analyze resume from text
- `POST /api/resume/analyze/upload` - Analyze resume from PDF
- `GET /api/resume/history?page=1&limit=6` - Get analysis history

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production server
