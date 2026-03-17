// load env from project root when running script directly
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Wait for the shared mongoose connection promise before doing any queries
const connectDatabase = require('../database.cjs');
const mongoose = require('./db'); // still need the mongoose instance for models
const User = require('./models/User');

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (existingAdmin) {
      console.log('Admin found, updating missing fields if any...');
      existingAdmin.password = existingAdmin.password || 'Admin@123';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin updated successfully');
      process.exit();
    }

    const admin = new User({
      email: 'admin@gmail.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await admin.save();

    console.log('Admin created successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

connectDatabase
  .then(() => createAdmin())
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });