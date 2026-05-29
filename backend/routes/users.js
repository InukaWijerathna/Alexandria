const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// GET /users/profile — current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
            const db = await getDb();
        const user = await db.get(
            'SELECT fullname, email, phone, bio FROM users WHERE id = ?',
            [req.user.id]
        );
        res.json({
            fullName: user?.fullname || '',
            email: user?.email || '',
            phone: user?.phone || '',
            bio: user?.bio || '',
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile.' });
    }
});

// PUT /users/profile — update current user's profile
router.put('/profile', authMiddleware, async (req, res) => {
    const { fullName, email, phone, bio } = req.body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    try {
            const db = await getDb();
        await db.run(
            'UPDATE users SET fullname = ?, email = ?, phone = ?, bio = ? WHERE id = ?',
            [fullName?.trim() || null, email?.trim() || null, phone?.trim() || null, bio?.trim() || null, req.user.id]
        );
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
});

// POST /users — admin creates a new user (any role)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { username, password, role } = req.body;

    if (!username?.trim() || username.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const validRoles = ['member', 'admin'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
    }

    try {
            const db = await getDb();
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username.trim(), hashedPassword, role || 'member']
        );
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
            return res.status(400).json({ message: 'Username already taken.' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user.' });
    }
});

// GET /users — all users with pagination (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;

    try {
            const db = await getDb();
        const countRow = await db.get('SELECT COUNT(*) AS total FROM users');
        const total = parseInt(countRow?.total || 0);
        const users = await db.all(
            'SELECT id, username, role FROM users ORDER BY username LIMIT ? OFFSET ?',
            [limit, offset]
        );
        res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
});

// DELETE /users/:id — remove user and their borrow records (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    try {
        const db = await getDb();
        await db.run('DELETE FROM borrows WHERE userid = ?', [id]);
        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user.' });
    }
});

module.exports = router;
