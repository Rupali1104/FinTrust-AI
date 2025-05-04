const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const { db } = require('./db/config');
const usersRouter = require('./routes/users');
const applicationsRouter = require('./routes/applications');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const initDatabase = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                business_type TEXT,
                credit_score INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create applications table
            db.run(`CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                business_type TEXT NOT NULL,
                loan_amount REAL NOT NULL,
                risk_score INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create admins table
            db.run(`CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create default admin if not exists
            const defaultAdmin = {
                email: 'admin@fintrust.com',
                password: 'admin123'
            };

            db.get('SELECT * FROM admins WHERE email = ?', [defaultAdmin.email], async (err, row) => {
                if (err) {
                    console.error('Error checking for default admin:', err);
                    reject(err);
                    return;
                }

                if (!row) {
                    try {
                        const hash = await bcrypt.hash(defaultAdmin.password, 10);
                        db.run('INSERT INTO admins (email, password_hash) VALUES (?, ?)',
                            [defaultAdmin.email, hash],
                            (err) => {
                                if (err) {
                                    console.error('Error creating default admin:', err);
                                    reject(err);
                                } else {
                                    console.log('Default admin user created');
                                    console.log('Email:', defaultAdmin.email);
                                    console.log('Password:', defaultAdmin.password);
                                    resolve();
                                }
                            });
                    } catch (err) {
                        console.error('Error hashing password:', err);
                        reject(err);
                    }
                } else {
                    console.log('Default admin already exists');
                    resolve();
                }
            });
        });
    });
};

// Routes
app.use('/api/users', usersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server after database initialization
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
