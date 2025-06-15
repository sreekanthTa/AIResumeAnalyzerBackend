import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


import grokRoutes from './routes/grok.router.js';

dotenv.config();
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));


app.use('/api/resume', grokRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Resume Analysis API');
});

export default app;
