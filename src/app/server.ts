import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './common/config/env.config';
import { connectDB } from './common/config/database';
import { errorHandler } from './common/middlewares/errorHandler';
import { rootRouter } from './router/index';

import { CONSTANTS } from './common/constants';

const app: Application = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api', rootRouter);

app.get('/', (req, res) => {
    res.json({ message: CONSTANTS.MESSAGES.COMMON.SERVER_RUNNING });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: CONSTANTS.MESSAGES.COMMON.ROUTE_NOT_FOUND });
});

app.use(errorHandler);

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
});

process.on('SIGTERM', () => {
    server.close(() => {
        process.exit(0);
    });
});
