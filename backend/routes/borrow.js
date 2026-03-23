const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

// Check Out a Book
router.post('/checkout', authMiddleware, async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;
    const db = await getDb();

    try {
        const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
        if (!book || book.status !== 'available') {
            return res.status(400).json({ message: 'Book is not available for checkout' });
        }

        const checkoutDate = new Date().toISOString();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days later

        await db.run('BEGIN TRANSACTION');
        await db.run('INSERT INTO borrows (userId, bookId, checkoutDate, dueDate) VALUES (?, ?, ?, ?)', [userId, bookId, checkoutDate, dueDate.toISOString()]);
        await db.run('UPDATE books SET status = ? WHERE id = ?', ['borrowed', bookId]);
        await db.run('COMMIT');

        res.json({ message: 'Book checked out successfully', dueDate: dueDate.toISOString() });
    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Error checking out book' });
    }
});

// Return a Book
router.post('/return', authMiddleware, async (req, res) => {
    const { bookId } = req.body;
    const db = await getDb();

    try {
        const borrow = await db.get('SELECT * FROM borrows WHERE bookId = ? AND returnDate IS NULL', [bookId]);
        if (!borrow) return res.status(400).json({ message: 'Book is not currently borrowed' });

        const returnDate = new Date().toISOString();

        await db.run('BEGIN TRANSACTION');
        await db.run('UPDATE borrows SET returnDate = ? WHERE id = ?', [returnDate, borrow.id]);
        await db.run('UPDATE books SET status = ? WHERE id = ?', ['available', bookId]);
        await db.run('COMMIT');

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Error returning book' });
    }
});

// Get My Borrows
router.get('/my-borrows', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const db = await getDb();

    try {
        const borrows = await db.all(`
            SELECT b.*, bo.title, bo.author, bo.isbn, bo.genre
            FROM borrows b
            JOIN books bo ON b.bookId = bo.id
            WHERE b.userId = ? AND b.returnDate IS NULL
        `, [userId]);
        res.json(borrows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrows' });
    }
});

module.exports = router;
