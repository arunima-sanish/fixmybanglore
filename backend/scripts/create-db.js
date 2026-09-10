/**
 * Creates the target database named in DATABASE_URL if it doesn't exist yet.
 * Connects to the built-in `postgres` maintenance database to do it.
 * Run: node scripts/create-db.js   (or: npm run db:setup)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const target = new URL(url);
const dbName = decodeURIComponent(target.pathname.replace(/^\//, ''));

if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(dbName)) {
  console.error(`Refusing to create database with unusual name: "${dbName}"`);
  process.exit(1);
}

async function main() {
  const admin = new URL(url);
  admin.pathname = '/postgres';

  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (rowCount > 0) {
      console.log(`Database "${dbName}" already exists`);
      return;
    }
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database "${dbName}"`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Could not create database:', err.message || err);
  process.exit(1);
});
