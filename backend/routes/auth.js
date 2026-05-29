const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

function validateSignup(username, password) {
    if (!username || typeof username !== 'string') return 'Username is required.';
    if (username.trim().length < 3) return 'Username must be at least 3 characters.';
    if (username.trim().length > 50) return 'Username must be 50 characters or fewer.';
    if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) return 'Username may only contain letters, numbers, underscores, dots, and hyphens.';
    if (!password || typeof password !== 'string') return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password.length > 128) return 'Password must be 128 characters or fewer.';
    return null;
}

// Signup — always registers as 'member'; role cannot be set by the client
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    const validationError = validateSignup(username, password);
    if (validationError) return res.status(400).json({ message: validationError });

    const db = await getDb();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username.trim(), hashedPassword, 'member']
        );
        res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
        // SQLite: SQLITE_CONSTRAINT  |  PostgreSQL: 23505 unique_violation
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
            return res.status(400).json({ message: 'Username already taken.' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating account.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = await getDb();
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(400).json({ message: 'Invalid username or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid username or password.' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in.' });
    }
});

module.exports = router;
