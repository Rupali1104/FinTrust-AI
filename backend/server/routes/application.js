const express = require('express');
const router = express.Router();
const { db } = require('../db/config');
const { sendReferenceFormEmail } = require('../utils/emailService');

// Submit new application
router.post('/submit', async (req, res) => {
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
        bank_account_age,
        reference1Email,
        reference2Email
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !reference1Email || !reference2Email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Start a transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Insert application
            db.run(`INSERT INTO applications (
                full_name, email, phone, income, employment_status, employment_duration,
                loan_amount, loan_purpose, credit_score, debt_to_income_ratio,
                collateral_value, bank_account_age, application_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                full_name, email, phone, income, employment_status, employment_duration,
                loan_amount, loan_purpose, credit_score, debt_to_income_ratio,
                collateral_value, bank_account_age
            ], async function(err) {
                if (err) {
                    console.error('Database error:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error submitting application' });
                }

                const applicationId = this.lastID;

                // Send emails to references
                try {
                    console.log('Sending email to reference 1:', reference1Email);
                    const email1Sent = await sendReferenceFormEmail(reference1Email, full_name);
                    
                    console.log('Sending email to reference 2:', reference2Email);
                    const email2Sent = await sendReferenceFormEmail(reference2Email, full_name);

                    if (!email1Sent || !email2Sent) {
                        throw new Error('Failed to send one or more reference emails');
                    }

                    db.run('COMMIT');
                    res.json({
                        id: applicationId,
                        message: 'Application submitted successfully. Reference forms have been sent.'
                    });
                } catch (emailError) {
                    console.error('Error sending reference emails:', emailError);
                    db.run('ROLLBACK');
                    res.status(500).json({ 
                        error: 'Application submitted but failed to send reference emails. Please try again.'
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error in application submission:', error);
        res.status(500).json({ error: 'Server error during application submission' });
    }
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