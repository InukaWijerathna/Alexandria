const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /borrow/checkout
router.post('/checkout', authMiddleware, async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) return res.status(400).json({ message: 'bookId is required.' });

    const db = await getDb();
    try {
        const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
        if (!book) return res.status(404).json({ message: 'Book not found.' });
        if (book.status !== 'available') {
            return res.status(400).json({ message: 'Book is not available for checkout.' });
        }

        const checkoutDate = new Date().toISOString();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        await db.transaction(async (tx) => {
            await tx.run(
                'INSERT INTO borrows (userId, bookId, checkoutDate, dueDate) VALUES (?, ?, ?, ?)',
                [userId, bookId, checkoutDate, dueDate.toISOString()]
            );
            await tx.run('UPDATE books SET status = ? WHERE id = ?', ['borrowed', bookId]);
        });

        res.json({ message: 'Book checked out successfully.', dueDate: dueDate.toISOString() });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Error checking out book.' });
    }
});

// POST /borrow/return
router.post('/return', authMiddleware, async (req, res) => {
    const { bookId } = req.body;

    if (!bookId) return res.status(400).json({ message: 'bookId is required.' });

    const db = await getDb();
    try {
        const borrow = await db.get(
            'SELECT * FROM borrows WHERE bookId = ? AND returnDate IS NULL',
            [bookId]
        );
        if (!borrow) return res.status(400).json({ message: 'Book is not currently borrowed.' });

        const returnDate = new Date().toISOString();

        await db.transaction(async (tx) => {
            await tx.run('UPDATE borrows SET returnDate = ? WHERE id = ?', [returnDate, borrow.id]);
            await tx.run('UPDATE books SET status = ? WHERE id = ?', ['available', bookId]);
        });

        res.json({ message: 'Book returned successfully.' });
    } catch (error) {
        console.error('Return error:', error);
        res.status(500).json({ message: 'Error returning book.' });
    }
});

// GET /borrow/my-borrows — active borrows only
router.get('/my-borrows', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const db = await getDb();
    try {
        const borrows = await db.all(
            `SELECT b.id, b.bookId, b.checkoutDate, b.dueDate,
                    bo.title, bo.author, bo.isbn, bo.genre
             FROM borrows b
             JOIN books bo ON b.bookId = bo.id
             WHERE b.userId = ? AND b.returnDate IS NULL
             ORDER BY b.dueDate ASC`,
            [userId]
        );
        res.json(borrows);
    } catch (error) {
        console.error('Error fetching borrows:', error);
        res.status(500).json({ message: 'Error fetching active borrows.' });
    }
});

// GET /borrow/history — full borrowing history with pagination
router.get('/history', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    const db = await getDb();
    try {
        const history = await db.all(
            `SELECT b.id, b.checkoutDate, b.dueDate, b.returnDate,
                    bo.title, bo.author, bo.genre
             FROM borrows b
             JOIN books bo ON b.bookId = bo.id
             WHERE b.userId = ?
             ORDER BY b.checkoutDate DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const countRow = await db.get(
            'SELECT COUNT(*) AS total FROM borrows WHERE userId = ?',
            [userId]
        );
        const total = parseInt(countRow?.total || 0);

        res.json({
            history,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching borrowing history.' });
    }
});

module.exports = router;
