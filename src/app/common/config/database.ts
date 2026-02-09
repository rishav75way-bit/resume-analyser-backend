import mongoose from 'mongoose';
import { env } from './env.config';

export const connectDB = async (): Promise<void> => {
    try {
        if (!env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in env');
        }
        await mongoose.connect(env.MONGODB_URI);
    } catch (error) {
        process.exit(1);
    }
};
