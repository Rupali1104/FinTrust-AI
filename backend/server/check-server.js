const { db } = require('./db/config');

// Check database connection
db.get('SELECT name FROM sqlite_master WHERE type="table"', (err, row) => {
    if (err) {
        console.error('Error checking database:', err);
        return;
    }
    console.log('Database connection successful');
    
    // Check if tables exist
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
        if (err) {
            console.error('Error checking tables:', err);
            return;
        }
        console.log('Existing tables:', tables.map(t => t.name));
        
        // Check if admin table exists and has data
        db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
            if (err) {
                console.error('Error checking admin table:', err);
                return;
            }
            console.log('Number of admin users:', row.count);
            
            // Check default admin
            db.get('SELECT * FROM admins WHERE email = ?', ['admin@fintrust.com'], (err, admin) => {
                if (err) {
                    console.error('Error checking default admin:', err);
                    return;
                }
                if (admin) {
                    console.log('Default admin exists');
                } else {
                    console.log('Default admin does not exist');
                }
            });
        });
    });
}); 