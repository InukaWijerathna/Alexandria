const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const path = require('path');

let db;
let pool;

function pgParams(sql, params = []) {
    let i = 0;
    return { text: sql.replace(/\?/g, () => `$${++i}`), values: params };
}

function makeClientProxy(client) {
    return {
        all: async (sql, params = []) => (await client.query(pgParams(sql, params))).rows,
        get: async (sql, params = []) => (await client.query(pgParams(sql, params))).rows[0],
        run: async (sql, params = []) => client.query(pgParams(sql, params)),
    };
}

async function initDb() {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 3,
            connectionTimeoutMillis: 8000,
            idleTimeoutMillis: 20000,
        });

        db = {
            all: async (sql, params = []) => (await pool.query(pgParams(sql, params))).rows,
            get: async (sql, params = []) => (await pool.query(pgParams(sql, params))).rows[0],
            run: async (sql, params = []) => pool.query(pgParams(sql, params)),
            exec: async (sql) => pool.query(sql),
            transaction: async (callback) => {
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const result = await callback(makeClientProxy(client));
                    await client.query('COMMIT');
                    return result;
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
                }
            },
        };

        // Single round-trip: create tables + all migrations in one query
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'member',
                fullname TEXT,
                email TEXT,
                phone TEXT,
                bio TEXT
            );
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT UNIQUE,
                genre TEXT,
                status TEXT DEFAULT 'available'
            );
            CREATE TABLE IF NOT EXISTS borrows (
                id SERIAL PRIMARY KEY,
                userid INTEGER REFERENCES users(id),
                bookid INTEGER REFERENCES books(id),
                checkoutdate TEXT,
                duedate TEXT,
                returndate TEXT
            );
            ALTER TABLE users ADD COLUMN IF NOT EXISTS fullname TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
            CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
            CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
        `);

        console.log('PostgreSQL database initialized.');
    } else {
        db = await open({
            filename: path.join(__dirname, 'library.db'),
            driver: sqlite3.Database,
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'member',
                fullname TEXT,
                email TEXT,
                phone TEXT,
                bio TEXT
            );
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
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

        for (const col of ['fullname', 'email', 'phone', 'bio']) {
            try { await db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`); } catch { /* exists */ }
        }

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
            CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
        `);

        db.transaction = async (callback) => {
            await db.run('BEGIN');
            try {
                const result = await callback(db);
                await db.run('COMMIT');
                return result;
            } catch (err) {
                await db.run('ROLLBACK');
                throw err;
            }
        };

        console.log('SQLite database initialized.');
    }
    return db;
}

async function getDb() {
    if (!db) await initDb();
    return db;
}

module.exports = { getDb };
