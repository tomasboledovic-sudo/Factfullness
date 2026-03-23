import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';

// Routes
import assessmentRoutes from './routes/assessmentRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Načítanie Gemini API key z .env
const envContent = readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');
const envVars = {};
envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
            const key = trimmed.substring(0, idx).trim();
            const value = trimmed.substring(idx + 1).trim();
            envVars[key] = value;
        }
    }
});

process.env.GEMINI_API_KEY = envVars.GEMINI_API_KEY;
process.env.JWT_SECRET = envVars.JWT_SECRET || 'learnflow-secret-key-2026';
process.env.PORT = envVars.PORT || '3000';
process.env.SUPABASE_URL = envVars.SUPABASE_URL;
process.env.SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions', assessmentRoutes);
app.use('/api/sessions', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Došlo k chybe na serveri',
            details: err.details || null
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint neexistuje'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server beží na http://localhost:${PORT}`);
    console.log(`✅ Gemini API key: ${process.env.GEMINI_API_KEY ? 'Načítaný' : 'CHÝBA!'}`);
    console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL ? 'Načítaná' : 'CHÝBA!'}`);
});

