const express = require('express');
const Report = require('../models/Report');

const router = express.Router();

// GET /api/places – unique place names derived from report addresses
router.get('/', async (req, res) => {
  try {
    const rawPlaces = await Report.distinctAddresses();

    const places = rawPlaces
      .filter((addr) => typeof addr === 'string' && addr.trim() !== '')
      .map((addr) => addr.split(',')[0].trim())
      .filter(Boolean);

    const uniqueSorted = Array.from(new Set(places)).sort((a, b) =>
      a.localeCompare(b)
    );

    res.json(uniqueSorted);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'Error fetching places' });
  }
});

module.exports = router;
