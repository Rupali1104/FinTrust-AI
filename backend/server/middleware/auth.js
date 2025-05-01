const jwt = require('jsonwebtoken');
const { db } = require('../db/config');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Change this in production

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

const checkUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied. User privileges required.' });
  }
  next();
};

const authenticateAdmin = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Token decoded successfully for admin ID:', decoded.id);

            db.get('SELECT * FROM admins WHERE id = ?', [decoded.id], (err, admin) => {
                if (err) {
                    console.error('Database error during admin verification:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!admin) {
                    console.log('Admin not found for ID:', decoded.id);
                    return res.status(401).json({ error: 'Invalid token' });
                }

                req.admin = admin;
                next();
            });
        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        console.error('Unexpected error in authentication:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    authenticateToken,
    checkAdmin,
    checkUser,
    authenticateAdmin
}; 