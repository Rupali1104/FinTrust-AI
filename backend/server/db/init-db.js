const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'fintrust.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to the SQLite database');
});

// Initialize database tables
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create applications table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        business_type TEXT,
        loan_amount REAL,
        risk_score INTEGER DEFAULT 0,
        application_status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create admins table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if default admin exists
    db.get("SELECT * FROM admins WHERE email = 'admin@fintrust.com'", (err, row) => {
        if (err) {
            console.error('Error checking admin:', err);
            return;
        }
        
        if (!row) {
            // Create default admin
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run('INSERT INTO admins (email, password) VALUES (?, ?)',
                ['admin@fintrust.com', hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error creating admin:', err);
                    } else {
                        console.log('Default admin created');
                    }
                });
        } else {
            console.log('Default admin already exists');
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed');
    }
}); 