import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import grokRoutes from './routes/grok.router.js';
import authRoutes from './routes/auth.router.js';
import questionRoutes from './routes/question.router.js';
import testCaseRoutes from './routes/test_case.router.js';

dotenv.config();
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN, // Replace with your frontend's exact origin
    credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

// Middleware to set headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN); // Replace with your frontend's exact origin
    next();
});

app.use('/api/resume', grokRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/test_cases', testCaseRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Resume Analysis API');
});

export default app;
