const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

const connectDatabase = require('../database.cjs');
const mongoose = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Fix My Bangalore API',
    docs: 'API routes: /api/auth, /api/reports, /api/upload'
  });
});


function waitForConnection(conn) {
  if (conn.readyState === 1) return Promise.resolve(conn);
  return new Promise((resolve) =>
    conn.once('connected', () => resolve(conn))
  );
}


connectDatabase
  .then((conn) => waitForConnection(conn))
  .then(() => {
    const authRoutes = require('./routes/auth');
    const uploadRoutes = require('./routes/upload');
    const issuesRoutes = require('./routes/issues');

    app.use('/api/auth', authRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/reports', issuesRoutes);

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT} (DB readyState: ${mongoose.connection.readyState})`
      );
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });