const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/config');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/application');

// Create Express app
const app = express();

// Initialize database
initDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/application', applicationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
