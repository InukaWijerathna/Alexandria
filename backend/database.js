const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const path = require('path');

let db;
let isPostgres = false;

async function initDb() {
    if (process.env.DATABASE_URL) {
        console.log('Connecting to PostgreSQL...');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        isPostgres = true;
        
        // Wrapper to stay compatible with sqlite-like calls
        db = {
            all: async (sql, params) => {
                let i = 0;
                const res = await pool.query(sql.replace(/\?/g, () => `$${++i}`), params);
                return res.rows;
            },
            get: async (sql, params) => {
                let i = 0;
                const res = await pool.query(sql.replace(/\?/g, () => `$${++i}`), params);
                return res.rows[0];
            },
            run: async (sql, params) => {
                let i = 0;
                return await pool.query(sql.replace(/\?/g, () => `$${++i}`), params);
            },
            exec: async (sql) => {
                return await pool.query(sql);
            }
        };

        // Note: In Postgres we need to handle sequences/types slightly differently, 
        // but for CREATE TABLE IF NOT EXISTS, the basic syntax is mostly compatible.
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'member'
            );

            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title TEXT,
                author TEXT,
                isbn TEXT UNIQUE,
                genre TEXT,
                status TEXT DEFAULT 'available'
            );

            CREATE TABLE IF NOT EXISTS borrows (
                id SERIAL PRIMARY KEY,
                userId INTEGER REFERENCES users(id),
                bookId INTEGER REFERENCES books(id),
                checkoutDate TEXT,
                dueDate TEXT,
                returnDate TEXT
            );
        `);
        console.log('PostgreSQL Database initialized successfully.');
    } else {
        console.log('Connecting to SQLite...');
        db = await open({
            filename: path.join(__dirname, 'library.db'),
            driver: sqlite3.Database
        });

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
                userId INTEGER REFERENCES users(id),
                bookId INTEGER REFERENCES books(id),
                checkoutDate TEXT,
                dueDate TEXT,
                returnDate TEXT
            );
        `);
        console.log('SQLite Database initialized successfully.');
    }
    return db;
}

async function getDb() {
    if (!db) await initDb();
    return db;
}

module.exports = { getDb };
