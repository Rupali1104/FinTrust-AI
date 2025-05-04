const express = require('express');
const router = express.Router();
const { db } = require('../db/config');
const { generateRandomScore } = require('../utils/helpers');

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { full_name, email, business_type } = req.body;
        const credit_score = generateRandomScore(65, 90);

        const sql = `INSERT OR REPLACE INTO users (full_name, email, business_type, credit_score) 
                    VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [full_name, email, business_type, credit_score], function(err) {
            if (err) {
                console.error('Error creating user:', err);
                res.status(500).json({ error: 'Failed to create user' });
                return;
            }
            
            res.status(201).json({ 
                message: 'User created/updated successfully',
                credit_score 
            });
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const sql = `SELECT id, full_name, email, business_type, credit_score, created_at 
                    FROM users 
                    ORDER BY created_at DESC`;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error fetching users:', err);
                res.status(500).json({ error: 'Failed to fetch users' });
                return;
            }
            res.json(rows);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by email
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const sql = `SELECT * FROM users WHERE email = ?`;
        
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error('Error fetching user:', err);
                res.status(500).json({ error: 'Failed to fetch user' });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(row);
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router; 