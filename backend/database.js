const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
    db = await open({
        filename: path.join(__dirname, 'library.db'),
        driver: sqlite3.Database
    });

    // Create Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'member'
        );

        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            isbn TEXT UNIQUE,
            genre TEXT,
            status TEXT DEFAULT 'available'
        );

        CREATE TABLE IF NOT EXISTS borrows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            bookId INTEGER,
            checkoutDate TEXT,
            dueDate TEXT,
            returnDate TEXT,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(bookId) REFERENCES books(id)
        );
    `);

    console.log('Database initialized successfully.');
    return db;
}

async function getDb() {
    if (!db) await initDb();
    return db;
}

module.exports = { getDb };
