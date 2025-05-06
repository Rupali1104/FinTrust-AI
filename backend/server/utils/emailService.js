const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Log the current directory and .env file path
console.log('Current directory:', __dirname);
console.log('Looking for .env file at:', path.join(__dirname, '../../.env'));

// Log environment variables (without showing password)
console.log('Environment variables loaded:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

// Create a test transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '') // Remove any spaces from the password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email configuration error:', error);
        console.log('Please make sure you have set up your .env file with EMAIL_USER and EMAIL_PASS');
        console.log('Make sure there are no spaces in the values and the file is in the correct location');
        console.log('Current EMAIL_USER:', process.env.EMAIL_USER);
        console.log('Current EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
        
        // Try to read the .env file directly to debug
        try {
            const fs = require('fs');
            const envPath = path.join(__dirname, '../../.env');
            const envContent = fs.readFileSync(envPath, 'utf8');
            console.log('Raw .env file content (first line only):', envContent.split('\n')[0]);
        } catch (err) {
            console.error('Error reading .env file:', err);
        }
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send reference form email
const sendReferenceFormEmail = async (referenceEmail, applicantName) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
      return false;
    }

    // Validate input
    if (!referenceEmail || !applicantName) {
      console.error('Missing required parameters for email sending');
      return false;
    }

    const googleFormLink = 'https://forms.gle/mFJRzrQA2ik3jRkx6'; // Replace with your actual Google Form link

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: referenceEmail,
      subject: `Reference Request for ${applicantName}'s Loan Application`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Reference Request</h2>
          <p>Hello,</p>
          <p>${applicantName} has listed you as a reference for their loan application with FinTrust-AI.</p>
          <p>Please take a moment to provide your feedback by filling out our reference form:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${googleFormLink}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Fill Reference Form
            </a>
          </div>
          <p>Your feedback is important and will help us make an informed decision about this loan application.</p>
          <p>Thank you for your time.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    console.log(`Attempting to send email to: ${referenceEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
};

module.exports = {
  sendReferenceFormEmail
}; 