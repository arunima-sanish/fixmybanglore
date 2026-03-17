const express = require('express');
const mongoose = require('../db');
const Report = require('../models/Report');

const router = express.Router();

function ensureConnected(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: 'Database not ready. Try again in a moment.' });
  }
  next();
}

router.use(ensureConnected);

// GET /api/places – list of unique place names derived from report addresses
router.get('/', async (req, res) => {
  try {
    const rawPlaces = await Report.distinct('address');

    const places = rawPlaces
      .filter((addr) => typeof addr === 'string' && addr.trim() !== '')
      .map((addr) => addr.split(',')[0].trim())
      .filter(Boolean);

    const uniqueSorted = Array.from(new Set(places)).sort(
      (a, b) => a.localeCompare(b)
    );

    res.json(uniqueSorted);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'Error fetching places' });
  }
});

module.exports = router;