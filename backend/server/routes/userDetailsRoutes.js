import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../finTrust.db'));

// Get user details
router.get('/', (req, res) => {
  const userId = req.user.id;

  db.get('SELECT * FROM user_details WHERE user_id = ?', [userId], (err, details) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!details) {
      return res.status(404).json({ error: 'User details not found' });
    }

    res.json(details);
  });
});

// Submit user details
router.post('/', (req, res) => {
  const userId = req.user.id;
  const { business_name, business_type, annual_revenue, loan_amount, loan_purpose } = req.body;

  db.run(
    `INSERT INTO user_details 
     (user_id, business_name, business_type, annual_revenue, loan_amount, loan_purpose)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, business_name, business_type, annual_revenue, loan_amount, loan_purpose],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save user details' });
      }

      res.status(201).json({
        message: 'User details saved successfully',
        id: this.lastID
      });
    }
  );
});

export default router; 