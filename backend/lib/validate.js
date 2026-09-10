// Shared input validation for the auth routes.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt silently ignores anything past 72 bytes

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Validate an { email, password } body.
 * Returns the cleaned { email, password } or throws a ValidationError.
 * Pass { requireStrongPassword: true } for sign-up (login just checks presence).
 */
function parseCredentials(body, { requireStrongPassword = false } = {}) {
  const email = normalizeEmail(body && body.email);
  const password = body && typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    throw new ValidationError('Enter a valid email address');
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new ValidationError('Password is too long (max 72 characters)');
  }
  if (requireStrongPassword) {
    if (password.length < MIN_PASSWORD_LEN) {
      throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new ValidationError('Password must include at least one letter and one number');
    }
  }

  return { email, password };
}

module.exports = { parseCredentials, normalizeEmail, ValidationError, MIN_PASSWORD_LEN };
