import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../finTrust.db'));

// Get user's loan application result
router.get('/', (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT ud.*, u.name, u.email 
     FROM user_details ud 
     JOIN users u ON ud.user_id = u.id 
     WHERE ud.user_id = ?`,
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!result) {
        return res.status(404).json({ error: 'No application found' });
      }

      res.json(result);
    }
  );
});

export default router; 