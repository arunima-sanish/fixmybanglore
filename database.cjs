const mongoose = require('mongoose');

// Load from .env (MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_CLUSTER)
const user = process.env.MONGO_USER?.trim();
const pass = process.env.MONGO_PASS?.trim();
const db = process.env.MONGO_DB?.trim();
const cluster = process.env.MONGO_CLUSTER?.trim();

// Encode user/pass so special characters in password don't break the URI
const mongoURI = user && pass && db && cluster
  ? `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${cluster}/${db}?retryWrites=true&w=majority`
  : process.env.MONGO_URI?.trim();

if (!mongoURI) {
  console.error('Missing MongoDB config. Set MONGO_URI or MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_CLUSTER in .env');
  process.exit(1);
}

// Don't buffer commands - fail immediately if not connected
mongoose.set('bufferCommands', false);

const connectPromise = mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  .then(async () => {
    console.log('MongoDB connected!');
    const conn = mongoose.connection;
    if (conn.readyState !== 1) {
      await new Promise((resolve, reject) => {
        conn.once('connected', resolve);
        conn.once('error', reject);
      });
    }
    // One real operation so subsequent findOne() etc. don't buffer
    if (conn.db) {
      await conn.db.admin().command({ ping: 1 });
    }
    console.log('MongoDB ready for queries');
    return conn;
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

module.exports = connectPromise;
