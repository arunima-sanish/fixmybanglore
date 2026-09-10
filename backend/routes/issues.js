const express = require('express');
const Report = require('../models/Report');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

//
// GET REPORTS (optionally filtered by place)
// GET /api/reports
// GET /api/reports?place=Koramangala
//
router.get('/', async (req, res) => {
  try {
    const rows = await Report.findAll({ place: req.query.place });
    res.json(rows.map(Report.serialize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// GET MY REPORTS (logged-in user)
// GET /api/reports/mine
//
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const rows = await Report.findByReporter(req.user.email);
    res.json(rows.map(Report.serialize));
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
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(Report.serialize(report));
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
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      category: category ? String(category).trim() : '',
      address: address ? String(address).trim() : '',
      location: location && typeof location === 'object' ? location : {},
      contact: contact ? String(contact).trim() : '',
      severity: severity ? String(severity).trim() : '',
      images: Array.isArray(images) ? images : [],
      reportedBy: req.user.email,
      status: 'pending',
    });

    res.status(201).json(Report.serialize(report));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// UPDATE REPORT (admin only)
// PATCH /api/reports/:id
//
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const fields = {};
    if (status !== undefined) fields.status = status;
    if (adminNotes !== undefined) fields.admin_notes = adminNotes;

    const report = await Report.updateById(req.params.id, fields);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(Report.serialize(report));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
