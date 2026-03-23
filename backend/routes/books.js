const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all books with search and filter
router.get('/', async (req, res) => {
    const { title, genre } = req.query;
    const db = await getDb();
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
    }
    if (genre) {
        query += ' AND genre LIKE ?';
        params.push(`%${genre}%`);
    }

    try {
        const books = await db.all(query, params);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Add a book (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { title, author, isbn, genre } = req.body;
    const db = await getDb();

    try {
        await db.run('INSERT INTO books (title, author, isbn, genre) VALUES (?, ?, ?, ?)', [title, author, isbn, genre]);
        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding book' });
    }
});

// Update a book (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, genre, status } = req.body;
    const db = await getDb();

    try {
        await db.run('UPDATE books SET title = ?, author = ?, isbn = ?, genre = ?, status = ? WHERE id = ?', [title, author, isbn, genre, status || 'available', id]);
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating book' });
    }
});

// Delete a book (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const db = await getDb();

    try {
        await db.run('DELETE FROM books WHERE id = ?', [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book' });
    }
});

module.exports = router;
