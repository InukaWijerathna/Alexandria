const { getDb } = require('./database');
const https = require('https');

async function fetchBooksData() {
    return new Promise((resolve, reject) => {
        const url = 'https://openlibrary.org/search.json?q=classic+fiction&fields=title,author_name,isbn,subject,cover_i&limit=600';
        console.log('Fetching books from OpenLibrary...');
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.docs);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        const db = await getDb();
        console.log('Database connected.');
        await db.exec('DELETE FROM borrows');
        await db.exec('DELETE FROM books');
        console.log('Cleared database.');
        
        let docs = await fetchBooksData();
        console.log(`Found ${docs.length} raw results.`);
        
        let count = 0;
        for (const doc of docs) {
            if (count >= 200) break;
            
            const title = doc.title;
            let author = doc.author_name ? doc.author_name[0] : 'Unknown Author';
            let isbn = doc.isbn ? doc.isbn[0] : null;
            
            if (!title || !author || !isbn) continue;
            if (!doc.cover_i) continue; // Only add books that definitely have a cover image ID!

            let genre = doc.subject && doc.subject.length > 0 ? doc.subject[0] : 'Fiction';
            if (genre.length > 30) genre = genre.substring(0, 30);

            const cleanIsbn = isbn.replace(/-/g, '');
            const coverImage = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
                );
                count++;
                if (count % 25 === 0) console.log(`Inserted ${count} real books...`);
            } catch (err) {
                console.error('DB Insert Error:', err.message);
            }
        }
        
        console.log(`\nSuccessfully added ${count} real books with actual covers to the database!`);
    } catch (err) {
        console.error('Task failed:', err);
    }
}
run();