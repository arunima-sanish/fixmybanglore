const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}
if (
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET === 'fixmybanglore-secret-change-in-production'
) {
  console.error(
    'Weak JWT_SECRET. Set a long random value in .env:\n' +
    '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const { initDb, isReady } = require('./db');

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
    docs: 'API routes: /api/auth, /api/reports, /api/places, /api/upload',
  });
});

// Gate the API until the schema is ready so callers get a clean 503, not a crash.
app.use('/api', (req, res, next) => {
  if (!isReady()) {
    return res.status(503).json({ message: 'Database not ready. Try again in a moment.' });
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/reports', require('./routes/issues'));
app.use('/api/places', require('./routes/places'));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} (PostgreSQL ready)`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message || err);
    process.exit(1);
  });
