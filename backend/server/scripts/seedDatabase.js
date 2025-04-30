import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { seedUsers } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, '../../finTrust.db'));

async function seedDatabase() {
  try {
    // Clear existing data
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM user_details');

    // Insert users
    for (const user of seedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role],
        function(err) {
          if (err) {
            console.error('Error inserting user:', err);
            return;
          }

          // If user has details, insert them
          if (user.details) {
            db.run(
              `INSERT INTO user_details 
               (user_id, business_name, business_type, annual_revenue, 
                loan_amount, loan_purpose, credit_score, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                this.lastID,
                user.details.business_name,
                user.details.business_type,
                user.details.annual_revenue,
                user.details.loan_amount,
                user.details.loan_purpose,
                user.details.credit_score,
                user.details.status
              ],
              (err) => {
                if (err) {
                  console.error('Error inserting user details:', err);
                }
              }
            );
          }
        }
      );
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    db.close();
  }
}

seedDatabase(); 