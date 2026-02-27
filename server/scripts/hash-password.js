/**
 * One-time script: generates a bcrypt hash for a password.
 * Use this hash as the "password" value in MongoDB when adding a user manually.
 * Run from project root: node server/scripts/hash-password.js
 * Or run with custom password: node server/scripts/hash-password.js "YourPassword"
 */
const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'Arunima123@test';

bcrypt.hash(password, 10).then((hash) => {
  console.log('Use this as the password value in MongoDB (users collection):');
  console.log(hash);
});
