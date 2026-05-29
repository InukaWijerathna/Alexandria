require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { getDb } = require('./database');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — restrict to known origins; localhost always allowed for development
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // server-to-server / mobile
        if (
            allowedOrigins.includes(origin) ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'working',
        message: 'Alexandria API is live!',
        database: process.env.DATABASE_URL ? 'PostgreSQL (Supabase)' : 'SQLite (Local)',
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);

// Static files (production build)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    if (err.message?.startsWith('CORS:')) {
        return res.status(403).json({ message: err.message });
    }
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;

if (require.main === module) {
    async function startServer() {
        try {
            await getDb();
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    startServer();
}
