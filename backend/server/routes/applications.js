const express = require('express');
const router = express.Router();
const { db } = require('../db/config');

// Helper function to calculate risk score
const calculateRiskScore = () => {
    // Generate random score between 65 and 90
    const score = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
    console.log('Generated risk score:', score);
    return score;
};

// Create a new application
router.post('/', (req, res) => {
    console.log('Received application data:', req.body);
    
    const { full_name, business_type, loan_amount } = req.body;
    
    if (!full_name || !business_type || !loan_amount) {
        console.log('Missing required fields:', { full_name, business_type, loan_amount });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate risk score
    const risk_score = calculateRiskScore();
    console.log('Calculated risk score:', risk_score);

    const sql = `INSERT INTO applications 
                (full_name, business_type, loan_amount, risk_score, application_status) 
                VALUES (?, ?, ?, ?, ?)`;
    
    console.log('Executing SQL:', sql);
    console.log('With values:', [full_name, business_type, loan_amount, risk_score, 'PENDING']);
    
    db.run(sql, 
        [full_name, business_type, loan_amount, risk_score, 'PENDING'],
        function(err) {
            if (err) {
                console.error('Error creating application:', err);
                return res.status(500).json({ error: 'Failed to create application' });
            }
            
            console.log('Application created with ID:', this.lastID);
            
            // Get the newly created application
            db.get('SELECT * FROM applications WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    console.error('Error fetching new application:', err);
                    return res.status(500).json({ error: 'Failed to fetch application' });
                }
                
                console.log('Retrieved application from database:', row);
                res.status(201).json({ 
                    application_id: row.id,
                    message: 'Application created successfully',
                    risk_score: row.risk_score
                });
            });
        });
});

// Get all applications
router.get('/', (req, res) => {
    db.all('SELECT * FROM applications ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching applications:', err);
            return res.status(500).json({ error: 'Failed to fetch applications' });
        }
        res.json(rows);
    });
});

// Get latest application for a user
router.get('/latest/:email', (req, res) => {
    const { email } = req.params;
    
    db.get('SELECT * FROM applications WHERE full_name = (SELECT full_name FROM users WHERE email = ?) ORDER BY created_at DESC LIMIT 1',
        [email],
        (err, row) => {
            if (err) {
                console.error('Error fetching latest application:', err);
                return res.status(500).json({ error: 'Failed to fetch application' });
            }
            if (!row) {
                return res.status(404).json({ error: 'No application found' });
            }
            res.json(row);
        });
});

// Get application by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    console.log('Fetching application with ID:', id);
    
    db.get('SELECT * FROM applications WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).json({ error: 'Failed to fetch application' });
        }
        if (!row) {
            console.log('Application not found for ID:', id);
            return res.status(404).json({ error: 'Application not found' });
        }
        console.log('Retrieved application:', row);
        res.json(row);
    });
});

module.exports = router; 