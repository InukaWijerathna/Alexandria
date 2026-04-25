const { getDb } = require('./database');

async function updateRealCovers() {
    try {
        const db = await getDb();
        
        // The real ISBNs of the 8 classic books we seeded initially
        const realIsbns = [
            '978-0451524935', // 1984
            '978-0060935467', // To Kill a Mockingbird
            '978-0743273565', // The Great Gatsby
            '978-1503280786', // Moby Dick
            '978-1503290563', // Pride and Prejudice
            '978-0316769488', // The Catcher in the Rye
            '978-0547928227', // The Hobbit
            '978-1451673319'  // Fahrenheit 451
        ];

        // Fetch just the real books
        const books = await db.all(`SELECT id, title, isbn FROM books WHERE isbn IN (${realIsbns.map(() => '?').join(', ')})`, realIsbns);

        for (const book of books) {
            // Remove dashes from ISBN to use with OpenLibrary API
            const cleanIsbn = book.isbn.replace(/-/g, '');
            
            // Fetch real cover from Open Library API (Standard size: L)
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
            
            await db.run('UPDATE books SET coverImage = ? WHERE id = ?', [coverUrl, book.id]);
            console.log(`Added real cover for: ${book.title}`);
        }

        console.log(`\nSuccessfully applied real covers to ${books.length} authentic books!`);
    } catch (err) {
        console.error('Error updating real book covers:', err.message);
    }
}

updateRealCovers();