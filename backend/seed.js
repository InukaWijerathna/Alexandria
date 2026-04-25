const bcrypt = require('bcryptjs');
const { getDb } = require('./database');

async function seed() {
    try {
        const db = await getDb();
        console.log('Database connected.');

        // Dummy users (hashed passwords)
        const users = [
            { username: 'member1', password: 'password123', role: 'member' },
            { username: 'member2', password: 'password123', role: 'member' },
            { username: 'member3', password: 'password123', role: 'member' },
            { username: 'admin1', password: 'adminpassword', role: 'admin' }
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            try {
                await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [user.username, hashedPassword, user.role]);
                console.log(`User ${user.username} inserted.`);
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    console.log(`User ${user.username} already exists, skipping.`);
                } else {
                    console.error(`Error inserting user ${user.username}:`, err);
                }
            }
        }

        // Dummy books
        const books = [
            { title: '1984', author: 'George Orwell', isbn: '978-0451524935', genre: 'Dystopian', status: 'available' },
            { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0060935467', genre: 'Fiction', status: 'available' },
            { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', genre: 'Classic', status: 'available' },
            { title: 'Moby Dick', author: 'Herman Melville', isbn: '978-1503280786', genre: 'Adventure', status: 'available' },
            { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-1503290563', genre: 'Romance', status: 'available' },
            { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769488', genre: 'Fiction', status: 'available' },
            { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0547928227', genre: 'Fantasy', status: 'available' },
            { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '978-1451673319', genre: 'Dystopian', status: 'available' }
        ];

        for (const book of books) {
            try {
                await db.run('INSERT INTO books (title, author, isbn, genre, status) VALUES (?, ?, ?, ?, ?)', [book.title, book.author, book.isbn, book.genre, book.status]);
                console.log(`Book "${book.title}" inserted.`);
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    console.log(`Book "${book.title}" already exists, skipping.`);
                } else {
                    console.error(`Error inserting book "${book.title}":`, err);
                }
            }
        }

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Error during seeding:', err);
    }
}

seed();