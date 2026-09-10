const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const PUBLIC_COLUMNS = 'id, email, role, created_at, updated_at';

// Shape a DB row into the JSON the frontend expects (never includes password).
function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: String(row.id),
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  if (!/^\d+$/.test(String(id))) return null;
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

// Sign-up path only ever creates a normal user. Admins are seeded separately
// (seedAdmin.js), so this function deliberately does not take a role argument.
async function createUser({ email, password }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING *`,
    [email, hash]
  );
  return rows[0];
}

async function listUsers() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`
  );
  return rows;
}

async function setPassword(email, plainPassword) {
  const hash = await bcrypt.hash(plainPassword, 10);
  const { rows } = await pool.query(
    `UPDATE users SET password = $2, updated_at = now() WHERE email = $1 RETURNING *`,
    [email, hash]
  );
  return rows[0] || null;
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  serialize,
  findByEmail,
  findById,
  createUser,
  listUsers,
  setPassword,
  comparePassword,
};
