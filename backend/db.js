// PostgreSQL connection pool shared by every model / route.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

let ready = false;

// Create tables if they don't exist yet. Called once on server start.
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  ready = true;
}

// Used by a middleware gate so requests get a clean 503 before the DB is up.
function isReady() {
  return ready;
}

module.exports = { pool, initDb, isReady };
