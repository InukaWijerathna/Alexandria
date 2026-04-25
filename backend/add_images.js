const { getDb } = require('./database');

async function addImages() {
    const db = await getDb();
    
    // Add column if it doesn't exist
    try {
        await db.run('ALTER TABLE books ADD COLUMN coverImage TEXT');
        console.log('Added coverImage column.');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('coverImage column already exists.');
        } else {
            console.error('Error adding column:', err.message);
        }
    }

    // Give each book a placeholder image
    const books = await db.all('SELECT id, title FROM books');
    for (const book of books) {
        // Create a URL-safe title text for placehold.co or similar
        const encodedTitle = encodeURIComponent(book.title);
        // Using placehold.co to generate a nice looking book cover lookalike
        // We can randomize colors a bit
        const bgColor = '132440';  // match new theme primary
        const textColor = 'c3cdd9'; // match secondary
        const coverImage = `https://placehold.co/400x600/${bgColor}/${textColor}?text=${encodedTitle}`;
        
        await db.run('UPDATE books SET coverImage = ? WHERE id = ?', [coverImage, book.id]);
    }
    
    console.log(`Updated ${books.length} books with cover images.`);
}

addImages();