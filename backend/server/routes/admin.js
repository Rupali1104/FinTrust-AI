const express = require('express');
const router = express.Router();
const { db } = require('../db/config');
const { authenticateAdmin } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Attempting admin login for:', email);
        
        db.get('SELECT * FROM admins WHERE email = ?', [email], async (err, admin) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!admin) {
                console.log('Login failed: Admin not found');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            try {
                const validPassword = await bcrypt.compare(password, admin.password_hash);
                if (!validPassword) {
                    console.log('Login failed: Invalid password');
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'your-secret-key');
                console.log('Login successful for:', email);
                res.json({ 
                    token,
                    message: 'Login successful',
                    admin: {
                        id: admin.id,
                        email: admin.email
                    }
                });
            } catch (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (err) {
        console.error('Unexpected error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all applications
router.get('/applications', authenticateAdmin, (req, res) => {
    db.all('SELECT * FROM applications ORDER BY created_at DESC', (err, applications) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching applications' });
        }
        res.json(applications);
    });
});

// Get application details
router.get('/applications/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM applications WHERE id = ?', [id], (err, application) => {
        if (err || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        db.all('SELECT * FROM application_history WHERE application_id = ? ORDER BY created_at DESC', 
            [id], (err, history) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching application history' });
                }
                res.json({ ...application, history });
            });
    });
});

// Update application status (only accept or reject)
router.put('/applications/:id/status', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
    }

    db.run('UPDATE applications SET application_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating application status' });
            }

            db.run('INSERT INTO application_history (application_id, status, notes, admin_id) VALUES (?, ?, ?, ?)',
                [id, status, notes, req.admin.id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error saving application history' });
                    }
                    res.json({ message: 'Application status updated successfully' });
                });
        });
});

// Calculate risk score and automatically set status
router.post('/applications/:id/calculate-score', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM applications WHERE id = ?', [id], (err, application) => {
        if (err || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Calculate risk score based on various factors
        let score = 0;
        
        // Income factor (0-20 points)
        if (application.income >= 50000) score += 20;
        else if (application.income >= 30000) score += 15;
        else if (application.income >= 20000) score += 10;
        else score += 5;

        // Employment duration (0-15 points)
        if (application.employment_duration >= 24) score += 15;
        else if (application.employment_duration >= 12) score += 10;
        else if (application.employment_duration >= 6) score += 5;

        // Debt-to-income ratio (0-20 points)
        if (application.debt_to_income_ratio <= 0.3) score += 20;
        else if (application.debt_to_income_ratio <= 0.5) score += 15;
        else if (application.debt_to_income_ratio <= 0.7) score += 10;
        else score += 5;

        // Bank account age (0-15 points)
        if (application.bank_account_age >= 24) score += 15;
        else if (application.bank_account_age >= 12) score += 10;
        else if (application.bank_account_age >= 6) score += 5;

        // Credit score (0-30 points)
        if (application.credit_score >= 750) score += 30;
        else if (application.credit_score >= 700) score += 25;
        else if (application.credit_score >= 650) score += 20;
        else if (application.credit_score >= 600) score += 15;
        else score += 10;

        // Determine status based on score
        const status = score >= 70 ? 'accepted' : 'rejected';

        // Update application with risk score and status
        db.run('UPDATE applications SET risk_score = ?, application_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [score, status, id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating risk score and status' });
                }

                // Add to history
                db.run('INSERT INTO application_history (application_id, status, notes, admin_id) VALUES (?, ?, ?, ?)',
                    [id, status, `Auto-generated status based on risk score: ${score}`, req.admin.id], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error saving application history' });
                        }
                        res.json({ 
                            risk_score: score,
                            status: status,
                            message: 'Risk score calculated and status updated automatically'
                        });
                    });
            });
    });
});

module.exports = router;