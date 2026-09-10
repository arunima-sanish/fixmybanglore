// Creates (or re-promotes) the default admin user. Run: npm run seed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function seedAdmin() {
  await initDb();

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', updated_at = now()
     RETURNING id, email, role`,
    [ADMIN_EMAIL, hash]
  );

  console.log('Admin ready:', rows[0]);
}

seedAdmin()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Failed to seed admin:', err.message || err);
    process.exit(1);
  });
