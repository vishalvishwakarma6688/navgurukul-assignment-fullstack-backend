import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import activityRoutes from './routes/activities.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import dashboardRoutes from './routes/dashboard.js';
import enrollmentRoutes from './routes/enrollments.js';
import mentorRoutes from './routes/mentor.js';

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        // Allow any localhost port in development
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'progressive-student-dashboard-backend'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/mentor', mentorRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND'
        }
    });
});

app.use(errorHandler);

const startServer = async () => {
    await connectDatabase();

    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
};

startServer();

export default app;
