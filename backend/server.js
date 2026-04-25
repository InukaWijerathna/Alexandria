require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDb } = require('./database');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// Static files (Production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the frontend index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the app for Vercel
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
    async function startServer() {
        try {
            await getDb();
            app.listen(PORT, () => {
                console.log(`Server is running on http://localhost:${PORT}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
        }
    }
    startServer();
}
