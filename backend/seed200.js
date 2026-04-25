const { getDb } = require('./database');

const genres = [
    'Fiction', 'Dystopian', 'Classic', 'Adventure', 
    'Romance', 'Fantasy', 'Science Fiction', 'Mystery', 
    'Thriller', 'Historical Fiction', 'Non-Fiction', 'Biography'
];
const prefixes = ['The', 'A', 'Return of the', 'Shadow of', 'Light in', 'Fall of', 'Rise of', 'Beyond the'];
const nouns = ['King', 'Ring', 'Sun', 'Moon', 'Empire', 'City', 'River', 'Mountain', 'Sword', 'Shield', 'Night', 'Day', 'Storm', 'Wind'];
const authors = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Robert Brown', 'Emily Davis', 'Michael Wilson', 'Sarah Miller', 'David Taylor', 'Laura Moore', 'James Anderson'];

function generateBook(index) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const title = `${prefix} ${noun} ${index}`;
    const author = authors[Math.floor(Math.random() * authors.length)];
    // Pseudo-random ISBN
    const isbn = `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    return { title, author, isbn, genre, status: 'available' };
}

async function seed200() {
    try {
        const db = await getDb();
        console.log('Database connected.');

        for (let i = 1; i <= 200; i++) {
            const book = generateBook(i);
            try {
                await db.run('INSERT INTO books (title, author, isbn, genre, status) VALUES (?, ?, ?, ?, ?)', [book.title, book.author, book.isbn, book.genre, book.status]);
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    // ignore duplicates
                } else {
                    console.error(`Error inserting book "${book.title}":`, err);
                }
            }
        }

        console.log('200 Books inserted successfully.');
    } catch (err) {
        console.error('Error during seeding:', err);
    }
}

seed200();