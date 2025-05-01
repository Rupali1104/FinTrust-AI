const express = require('express');
const router = express.Router();
const { db } = require('../db/config');

// Submit new application
router.post('/submit', (req, res) => {
    const {
        full_name,
        email,
        phone,
        income,
        employment_status,
        employment_duration,
        loan_amount,
        loan_purpose,
        credit_score,
        debt_to_income_ratio,
        collateral_value,
        bank_account_age
    } = req.body;

    db.run(`INSERT INTO applications (
        full_name, email, phone, income, employment_status, employment_duration,
        loan_amount, loan_purpose, credit_score, debt_to_income_ratio,
        collateral_value, bank_account_age, application_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rejected')`,
    [
        full_name, email, phone, income, employment_status, employment_duration,
        loan_amount, loan_purpose, credit_score, debt_to_income_ratio,
        collateral_value, bank_account_age
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error submitting application' });
        }
        res.json({
            id: this.lastID,
            message: 'Application submitted successfully. Please wait for admin review.'
        });
    });
});

// Get application status
router.get('/status/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT application_status, risk_score FROM applications WHERE id = ?', [id], (err, application) => {
        if (err || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json(application);
    });
});

module.exports = router; 