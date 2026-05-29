require('dotenv').config();

if (!process.env.JWT_SECRET) {
    if (require.main === module) {
        // Direct execution (local dev) — refuse to start without the secret
        console.error('FATAL: JWT_SECRET is not set. Exiting.');
        process.exit(1);
    } else {
        // Serverless (Vercel) — log and continue; auth routes will return 500 if called
        console.error('WARNING: JWT_SECRET is not set. Authentication will not work.');
    }
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

// CORS — if ALLOWED_ORIGINS is set, restrict to that list + localhost.
// If unset, allow all origins (preserves original behaviour for existing deployments).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // server-to-server / mobile
        if (allowedOrigins.length === 0) return callback(null, true); // no restriction configured
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

// Static files — only serve if the dist folder exists (local full-stack mode)
const distPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // Serverless / API-only mode: return a simple response for non-API routes
    app.get('*', (req, res) => {
        res.status(404).json({ message: 'This is the Alexandria API. The frontend is served separately.' });
    });
}

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
