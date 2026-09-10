/**
 * One-time fix: (re)hashes the password for a specific user so login works
 * if the password row was ever stored as plain text.
 * Run from the backend folder: node scripts/fix-user-password.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../db');
const User = require('../models/User');

const EMAIL = 'arunimasanish111@gmail.com';
const PLAIN_PASSWORD = 'Arunima123@test';

async function main() {
  const updated = await User.setPassword(EMAIL, PLAIN_PASSWORD);
  if (!updated) {
    console.error('User not found with email:', EMAIL);
    process.exit(1);
  }
  console.log('Password updated for', EMAIL, '- you can now log in with that password.');
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
  });
