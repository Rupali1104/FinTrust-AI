const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fintrust.db');
const db = new sqlite3.Database(dbPath);

console.log('Users in database:');
db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error reading users:', err);
    } else {
        console.log(rows);
    }
});

console.log('\nApplications in database:');
db.all('SELECT * FROM applications', [], (err, rows) => {
    if (err) {
        console.error('Error reading applications:', err);
    } else {
        console.log(rows);
    }
    // Close the database connection
    db.close();
}); 