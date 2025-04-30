import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import userDetailsRoutes from './routes/userDetailsRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import adminRoutes from './routes/admin.js';
import { authenticateToken, checkAdmin, checkUser } from './middleware/auth.js';
import { seedUsers } from './data/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, 'finTrust.db');
console.log('Database path:', dbPath);

// Delete existing database file if it exists
try {
  require('fs').unlinkSync(dbPath);
  console.log('Deleted existing database file');
} catch (err) {
  console.log('No existing database file to delete');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables and seed data
async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created/verified');
    }
  });

  // User details table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      business_name TEXT,
      business_type TEXT,
      annual_revenue REAL,
      loan_amount REAL,
      loan_purpose TEXT,
      credit_score INTEGER,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating user_details table:', err);
    } else {
      console.log('User details table created/verified');
    }
  });

  // Check if database is empty
  db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
    if (err) {
      console.error('Error checking database:', err);
      return;
    }

    console.log('Current user count:', row.count);

    if (row.count === 0) {
      console.log('Seeding database with initial data...');
      // Insert seed users
      for (const user of seedUsers) {
        console.log('Seeding user:', user.email);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role],
          function(err) {
            if (err) {
              console.error('Error inserting user:', err);
              return;
            }
            console.log('User inserted:', user.email);

            // If user has details, insert them
            if (user.details) {
              db.run(
                `INSERT INTO user_details 
                 (user_id, business_name, business_type, annual_revenue, 
                  loan_amount, loan_purpose, credit_score, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  this.lastID,
                  user.details.business_name,
                  user.details.business_type,
                  user.details.annual_revenue,
                  user.details.loan_amount,
                  user.details.loan_purpose,
                  user.details.credit_score,
                  user.details.status
                ],
                (err) => {
                  if (err) {
                    console.error('Error inserting user details:', err);
                  } else {
                    console.log('User details inserted for:', user.email);
                  }
                }
              );
            }
          }
        );
      }
      console.log('Database seeded successfully!');
    }
  });
}

// Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, checkUser, userRoutes);
app.use('/api/admin', authenticateToken, checkAdmin, adminRoutes);
app.use('/api/user-details', authenticateToken, checkUser, userDetailsRoutes);
app.use('/api/results', authenticateToken, checkUser, resultsRoutes);
console.log('Routes registered successfully');

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET /api/results');
  console.log('- GET /api/user/profile');
  console.log('- POST /api/user-details');
  console.log('- GET /api/admin/users (admin only)');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or close the application using port ${PORT}.`);
    process.exit(1);
  } else {
    console.error('Error starting server:', err);
    process.exit(1);
  }
});
