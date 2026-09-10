const { rateLimit } = require('express-rate-limit');

// Brute-force protection for login: at most 8 *failed* attempts per 15 min per IP.
// A successful login doesn't count, so normal users are never affected.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please wait 15 minutes and try again.',
  },
});

// Sign-up: at most 5 new accounts per hour per IP.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many accounts created from this network. Please try again later.',
  },
});

module.exports = { loginLimiter, registerLimiter };
