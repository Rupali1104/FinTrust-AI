import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../finTrust.db'));

// Get user profile
router.get('/profile', (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Submit user details for loan application
router.post('/submit-details', (req, res) => {
  const userId = req.user.id;
  const {
    business_name,
    business_type,
    annual_revenue,
    loan_amount,
    loan_purpose,
    credit_score
  } = req.body;

  // Validate required fields
  if (!business_name || !business_type || !annual_revenue || !loan_amount || !loan_purpose) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already has submitted details
  db.get('SELECT * FROM user_details WHERE user_id = ?', [userId], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      // Update existing details
      db.run(
        `UPDATE user_details 
         SET business_name = ?, business_type = ?, annual_revenue = ?, 
             loan_amount = ?, loan_purpose = ?, credit_score = ?, status = 'pending'
         WHERE user_id = ?`,
        [business_name, business_type, annual_revenue, loan_amount, loan_purpose, credit_score, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update details' });
          }
          res.json({ message: 'Details updated successfully' });
        }
      );
    } else {
      // Insert new details
      db.run(
        `INSERT INTO user_details 
         (user_id, business_name, business_type, annual_revenue, loan_amount, loan_purpose, credit_score)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, business_name, business_type, annual_revenue, loan_amount, loan_purpose, credit_score],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save details' });
          }
          res.status(201).json({ message: 'Details submitted successfully' });
        }
      );
    }
  });
});

// Get user's loan application status
router.get('/application-status', (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT * FROM user_details WHERE user_id = ?',
    [userId],
    (err, details) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!details) {
        return res.status(404).json({ error: 'No application found' });
      }
      res.json(details);
    }
  );
});

export default router; 