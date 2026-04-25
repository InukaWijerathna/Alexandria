const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    const db = await getDb();
    try {
        const users = await db.all('SELECT id, username, role FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Delete a user (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    
    try {
        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
