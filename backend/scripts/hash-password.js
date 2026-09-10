/**
 * One-time script: generates a bcrypt hash for a password.
 * Use this hash as the "password" value when inserting a user row by hand.
 * Run from the backend folder: node scripts/hash-password.js
 * Or with a custom password:   node scripts/hash-password.js "YourPassword"
 */
const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'Arunima123@test';

bcrypt.hash(password, 10).then((hash) => {
  console.log('Use this as the password value in the users table:');
  console.log(hash);
});
