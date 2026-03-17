const express = require('express');
const mongoose = require('../db');
const Report = require('../models/Report');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Ensure DB is connected
function ensureConnected(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not ready. Try again in a moment.' });
  }
  next();
}

router.use(ensureConnected);

//
// GET REPORTS (optionally filtered by place)
// GET /api/reports
// GET /api/reports?place=Koramangala
//
router.get('/', async (req, res) => {
  try {
    const { place } = req.query;

    const filter = {};
    if (place && place !== 'All') {
      // Case-insensitive match against address
      filter.address = new RegExp(place, 'i');
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      reports.map((r) => ({
        ...r,
        id: r._id.toString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// GET MY REPORTS (Logged-in User)
// GET /api/reports/mine
//
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      reports.map((r) => ({
        ...r,
        id: r._id.toString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// GET SINGLE REPORT
// GET /api/reports/:id
//
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      ...report,
      id: report._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// CREATE REPORT
// POST /api/reports
//
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      address,
      location,
      contact,
      severity,
      images,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title required' });
    }

    const report = await Report.create({
      title: title.trim(),
      description: description ? String(description).trim() : '',
      category: category ? String(category).trim() : '',
      address: address ? String(address).trim() : '',
      location: location && typeof location === 'object' ? location : {},
      contact: contact ? String(contact).trim() : '',
      severity: severity ? String(severity).trim() : '',
      images: Array.isArray(images) ? images : [],
      reportedBy: req.user.email,
      status: 'pending',
      adminNotes: '',
    });

    res.status(201).json({
      ...report.toObject(),
      id: report._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// UPDATE REPORT (Admin Only)
// PATCH /api/reports/:id
//
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const update = {};

    if (status !== undefined) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      ...report,
      id: report._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;