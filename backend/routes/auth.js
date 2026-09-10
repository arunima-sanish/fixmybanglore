const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');
const { parseCredentials, ValidationError } = require('../lib/validate');

const router = express.Router();

// A real hash to compare against when the email doesn't exist, so login takes the
// same time whether the account is missing or the password is just wrong.
const DUMMY_HASH = bcrypt.hashSync('unused-placeholder-password', 10);

function fail(res, err) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
}

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = parseCredentials(req.body);

    const user = await User.findByEmail(email);
    if (!user) {
      // Run a compare anyway so a missing email and a wrong password take the
      // same amount of time (don't leak which emails are registered).
      await User.comparePassword(password, DUMMY_HASH);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await User.comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ email: user.email, role: user.role, token });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password } = parseCredentials(req.body, { requireStrongPassword: true });

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Public sign-up is always a normal user. Admins are created only by
    // seedAdmin.js (or, later, by an existing admin).
    const user = await User.createUser({ email, password });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ email: user.email, role: user.role, token });
  } catch (err) {
    fail(res, err);
  }
});

// Fetch users (admin only)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.listUsers();
    res.json(users.map(User.serialize));
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
