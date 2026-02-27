/**
 * One-time fix: hashes the password for user arunimasanish111@gmail.com
 * so login works when the password was added as plain text in MongoDB.
 * Run from project root: node server/scripts/fix-user-password.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const connectDatabase = require(path.join(__dirname, '..', '..', 'database.cjs'));
const bcrypt = require('bcryptjs');

const EMAIL = 'arunimasanish111@gmail.com';
const PLAIN_PASSWORD = 'Arunima123@test';

connectDatabase
  .then(async (conn) => {
    const mongoose = conn.connection;
    const User = require(path.join(__dirname, '..', 'models', 'User'));

    const user = await User.findOne({ email: EMAIL });
    if (!user) {
      console.error('User not found with email:', EMAIL);
      process.exit(1);
    }

    const hash = await bcrypt.hash(PLAIN_PASSWORD, 10);
    await User.updateOne({ email: EMAIL }, { $set: { password: hash } });

    console.log('Password updated for', EMAIL, '- you can now log in with that password.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
