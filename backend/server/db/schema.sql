-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User applications table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    loan_amount DECIMAL(10,2) NOT NULL,
    risk_score DECIMAL(5,2),
    application_status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, or REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application history table
CREATE TABLE IF NOT EXISTS application_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER,
    status TEXT NOT NULL, -- PENDING, ACCEPTED, or REJECTED
    notes TEXT,
    admin_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
); 