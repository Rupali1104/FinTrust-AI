import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../finTrust.db'));

// Get all users and their details
router.get('/users', (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
            ud.business_name, ud.business_type, ud.annual_revenue,
            ud.loan_amount, ud.loan_purpose, ud.credit_score, ud.status
     FROM users u
     LEFT JOIN user_details ud ON u.id = ud.user_id
     ORDER BY u.created_at DESC`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Update user status
router.put('/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    'UPDATE user_details SET status = ? WHERE user_id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Status updated successfully' });
    }
  );
});

// Get all user applications
router.get('/applications', (req, res) => {
  db.all(
    `SELECT 
      ud.*, 
      u.name as user_name, 
      u.email as user_email
     FROM user_details ud
     JOIN users u ON ud.user_id = u.id
     ORDER BY ud.submitted_at DESC`,
    (err, applications) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(applications);
    }
  );
});

// Get application details by ID
router.get('/applications/:id', (req, res) => {
  const applicationId = req.params.id;

  db.get(
    `SELECT 
      ud.*, 
      u.name as user_name, 
      u.email as user_email
     FROM user_details ud
     JOIN users u ON ud.user_id = u.id
     WHERE ud.id = ?`,
    [applicationId],
    (err, application) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json(application);
    }
  );
});

// Update application status
router.patch('/applications/:id/status', (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE user_details SET status = ? WHERE id = ?',
    [status, applicationId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json({ message: 'Status updated successfully' });
    }
  );
});

// Get statistics
router.get('/statistics', (req, res) => {
  db.all(
    `SELECT 
      status,
      COUNT(*) as count,
      AVG(loan_amount) as avg_loan_amount,
      AVG(annual_revenue) as avg_annual_revenue
     FROM user_details
     GROUP BY status`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

export default router; 