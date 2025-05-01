const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const dbPath = path.join(__dirname, 'fintrust.db');
const db = new sqlite3.Database(dbPath);

// Sample loan applications data with Indian context
const sampleApplications = [
  {
    full_name: 'Rameshwar Prasad Yadav',
    business_type: 'General Store',
    loan_amount: 50000,
    risk_score: 75,
    application_status: 'PENDING'
  },
  {
    full_name: 'Lakshmi Bai Sharma',
    business_type: 'Beauty Parlor',
    loan_amount: 75000,
    risk_score: 82,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Harishchandra Patel',
    business_type: 'Auto Workshop',
    loan_amount: 100000,
    risk_score: 65,
    application_status: 'PENDING'
  },
  {
    full_name: 'Saraswati Devi Gupta',
    business_type: 'Boutique',
    loan_amount: 60000,
    risk_score: 78,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Brijesh Singh Rathore',
    business_type: 'Dhaba',
    loan_amount: 150000,
    risk_score: 70,
    application_status: 'PENDING'
  },
  {
    full_name: 'Kamala Bai Reddy',
    business_type: 'Medical Store',
    loan_amount: 80000,
    risk_score: 85,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Ganesh Prasad Mehta',
    business_type: 'Mobile Repair',
    loan_amount: 40000,
    risk_score: 72,
    application_status: 'PENDING'
  },
  {
    full_name: 'Radha Bai Joshi',
    business_type: 'Day Care',
    loan_amount: 90000,
    risk_score: 80,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Krishna Kumar Malhotra',
    business_type: 'Gym',
    loan_amount: 120000,
    risk_score: 68,
    application_status: 'PENDING'
  },
  {
    full_name: 'Sita Devi Kapoor',
    business_type: 'Coaching Center',
    loan_amount: 550000,
    risk_score: 88,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Mohan Lal Verma',
    business_type: 'Photo Studio',
    loan_amount: 70000,
    risk_score: 75,
    application_status: 'PENDING'
  },
  {
    full_name: 'Ganga Bai Choudhary',
    business_type: 'Sweet Shop',
    loan_amount: 65000,
    risk_score: 82,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Vishnu Prasad Agarwal',
    business_type: 'Electronics Shop',
    loan_amount: 110000,
    risk_score: 70,
    application_status: 'PENDING'
  },
  {
    full_name: 'Parvati Devi Mishra',
    business_type: 'Beauty Salon',
    loan_amount: 450000,
    risk_score: 85,
    application_status: 'ACCEPTED'
  },
  {
    full_name: 'Shiv Kumar Khanna',
    business_type: 'Book Store',
    loan_amount: 350000,
    risk_score: 78,
    application_status: 'PENDING'
  }
];

// Initialize database with schema
const initDb = () => {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    db.serialize(() => {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
            } else {
                console.log('Database initialized successfully');
                // Create default admin user if not exists
                createDefaultAdmin();
                // Create sample applications
                createSampleApplications();
            }
        });
    });
};

const createDefaultAdmin = () => {
    const defaultAdmin = {
        email: 'admin@fintrust.com',
        password: 'admin123' // This should be changed in production
    };

    console.log('Checking for existing admin user...');
    db.get('SELECT * FROM admins WHERE email = ?', [defaultAdmin.email], async (err, row) => {
        if (err) {
            console.error('Error checking for default admin:', err);
            return;
        }

        if (!row) {
            console.log('No admin user found, creating default admin...');
            try {
                const hash = await bcrypt.hash(defaultAdmin.password, 10);
                db.run('INSERT INTO admins (email, password_hash) VALUES (?, ?)',
                    [defaultAdmin.email, hash],
                    (err) => {
                        if (err) {
                            console.error('Error creating default admin:', err);
                        } else {
                            console.log('Default admin user created successfully');
                            console.log('Admin credentials:');
                            console.log('Email: admin@fintrust.com');
                            console.log('Password: admin123');
                        }
                    });
            } catch (err) {
                console.error('Error hashing password:', err);
            }
        } else {
            console.log('Admin user already exists');
        }
    });
};

const createSampleApplications = () => {
    console.log('Creating sample applications...');
    db.get('SELECT COUNT(*) as count FROM applications', (err, row) => {
        if (err) {
            console.error('Error checking applications count:', err);
            return;
        }

        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO applications (
                    full_name, business_type, loan_amount, risk_score, application_status
                ) VALUES (?, ?, ?, ?, ?)
            `);

            sampleApplications.forEach(app => {
                stmt.run(
                    app.full_name,
                    app.business_type,
                    app.loan_amount,
                    app.risk_score,
                    app.application_status
                );
            });

            stmt.finalize();
            console.log('Sample applications created successfully');
        } else {
            console.log('Applications already exist in the database');
        }
    });
};

module.exports = {
    db,
    initDb
}; 