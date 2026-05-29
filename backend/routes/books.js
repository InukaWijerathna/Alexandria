const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// GET /books/stats — dashboard stats (admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    const db = await getDb();
    try {
        const [total, available, borrowed, members] = await Promise.all([
            db.get('SELECT COUNT(*) AS count FROM books'),
            db.get("SELECT COUNT(*) AS count FROM books WHERE status = 'available'"),
            db.get("SELECT COUNT(*) AS count FROM books WHERE status = 'borrowed'"),
            db.get("SELECT COUNT(*) AS count FROM users WHERE role = 'member'"),
        ]);
        res.json({
            totalBooks: parseInt(total?.count || 0),
            available: parseInt(available?.count || 0),
            borrowed: parseInt(borrowed?.count || 0),
            totalMembers: parseInt(members?.count || 0),
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats.' });
    }
});

// GET /books/genres — distinct genre list (must be before /:id routes)
router.get('/genres', async (req, res) => {
    const db = await getDb();
    try {
        const rows = await db.all(
            "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre"
        );
        res.json(rows.map((r) => r.genre));
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ message: 'Error fetching genres.' });
    }
});

// GET /books — paginated, case-insensitive search
router.get('/', async (req, res) => {
    const { title, genre } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const db = await getDb();
    let where = 'WHERE 1=1';
    const params = [];

    if (title) {
        where += ' AND LOWER(title) LIKE LOWER(?)';
        params.push(`%${title}%`);
    }
    if (genre) {
        where += ' AND LOWER(genre) LIKE LOWER(?)';
        params.push(`%${genre}%`);
    }

    try {
        const countRow = await db.get(`SELECT COUNT(*) AS total FROM books ${where}`, params);
        const total = parseInt(countRow?.total || 0);

        const books = await db.all(
            `SELECT * FROM books ${where} ORDER BY title LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({ books, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books.' });
    }
});

// POST /books — add (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { title, author, isbn, genre } = req.body;

    if (!title?.trim() || !author?.trim()) {
        return res.status(400).json({ message: 'Title and author are required.' });
    }

    const db = await getDb();
    try {
        await db.run(
            'INSERT INTO books (title, author, isbn, genre) VALUES (?, ?, ?, ?)',
            [title.trim(), author.trim(), isbn?.trim() || null, genre?.trim() || null]
        );
        res.status(201).json({ message: 'Book added successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
            return res.status(400).json({ message: 'A book with that ISBN already exists.' });
        }
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Error adding book.' });
    }
});

// PUT /books/:id — update (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, genre, status } = req.body;

    if (!title?.trim() || !author?.trim()) {
        return res.status(400).json({ message: 'Title and author are required.' });
    }

    const validStatuses = ['available', 'borrowed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    const db = await getDb();
    try {
        await db.run(
            'UPDATE books SET title = ?, author = ?, isbn = ?, genre = ?, status = ? WHERE id = ?',
            [title.trim(), author.trim(), isbn?.trim() || null, genre?.trim() || null, status || 'available', id]
        );
        res.json({ message: 'Book updated successfully.' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Error updating book.' });
    }
});

// DELETE /books/:id — remove (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    try {
        await db.run('DELETE FROM books WHERE id = ?', [id]);
        res.json({ message: 'Book deleted successfully.' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Error deleting book.' });
    }
});

module.exports = router;
