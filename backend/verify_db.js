const { getDb } = require('./database');

async function verify() {
    const db = await getDb();
    console.log('--- USERS ---');
    console.log(await db.all('SELECT id, username, role FROM users'));
    console.log('\n--- BOOKS ---');
    console.log(await db.all('SELECT * FROM books'));
    console.log('\n--- BORROWS ---');
    console.log(await db.all('SELECT * FROM borrows'));
}

verify();
