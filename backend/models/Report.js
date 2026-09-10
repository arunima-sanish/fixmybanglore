const { pool } = require('../db');

const COLUMNS = `id, title, description, category, status, location, address,
  images, reported_by, contact, severity, admin_notes, created_at, updated_at`;

// Shape a DB row (snake_case) into the JSON the frontend expects (camelCase).
// Exposes both `id` and `_id` so components written against the old Mongo API keep working.
function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: String(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    location: row.location,
    address: row.address,
    images: row.images,
    reportedBy: row.reported_by,
    contact: row.contact,
    severity: row.severity,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

async function findAll({ place } = {}) {
  if (place && place !== 'All') {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM reports WHERE address ILIKE $1 ORDER BY created_at DESC`,
      [`%${place}%`]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM reports ORDER BY created_at DESC`
  );
  return rows;
}

async function findByReporter(email) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM reports WHERE reported_by = $1 ORDER BY created_at DESC`,
    [email]
  );
  return rows;
}

async function findById(id) {
  if (!isValidId(id)) return null;
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM reports WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO reports
      (title, description, category, status, location, address, images,
       reported_by, contact, severity, admin_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${COLUMNS}`,
    [
      data.title,
      data.description || '',
      data.category || '',
      data.status || 'pending',
      JSON.stringify(data.location && typeof data.location === 'object' ? data.location : {}),
      data.address || '',
      Array.isArray(data.images) ? data.images : [],
      data.reportedBy || '',
      data.contact || '',
      data.severity || '',
      data.adminNotes || '',
    ]
  );
  return rows[0];
}

// fields: a subset of { status, admin_notes }
async function updateById(id, fields) {
  if (!isValidId(id)) return null;

  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = keys.map((key) => fields[key]);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE reports SET ${setClause}, updated_at = now()
     WHERE id = $${values.length}
     RETURNING ${COLUMNS}`,
    values
  );
  return rows[0] || null;
}

async function distinctAddresses() {
  const { rows } = await pool.query(
    `SELECT DISTINCT address FROM reports WHERE address <> ''`
  );
  return rows.map((r) => r.address);
}

module.exports = {
  serialize,
  findAll,
  findByReporter,
  findById,
  create,
  updateById,
  distinctAddresses,
};
