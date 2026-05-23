import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDatabase = async () => {
    try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log(`MongoDB connected successfully to ${config.mongodb.uri}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};
