import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

console.log('Initializing results routes...');

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, '../finTrust.db'), (err) => {
  if (err) {
    console.error('Error connecting to database in results route:', err);
  } else {
    console.log('Results route connected to database');
  }
});

// Get user's loan application result
router.get('/', (req, res) => {
  console.log('GET /api/results called');
  console.log('User from token:', req.user);
  
  const userId = req.user.id;
  console.log('Fetching results for user ID:', userId);

  db.get(
    `SELECT ud.*, u.name, u.email 
     FROM user_details ud 
     JOIN users u ON ud.user_id = u.id 
     WHERE ud.user_id = ?`,
    [userId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!result) {
        console.log('No results found for user ID:', userId);
        return res.status(404).json({ error: 'No application found' });
      }

      console.log('Found results for user:', result.email);

      // Format the response
      const formattedResult = {
        business_name: result.business_name,
        business_type: result.business_type,
        annual_revenue: result.annual_revenue,
        loan_amount: result.loan_amount,
        loan_purpose: result.loan_purpose,
        credit_score: result.credit_score,
        status: result.status,
        name: result.name,
        email: result.email
      };

      res.json(formattedResult);
    }
  );
});

console.log('Results routes initialized');

export default router; 