const express = require('express');
const mongoose = require('../db');
const Issue = require('../models/Issue');
const Report = require('../models/Report');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

function ensureConnected(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not ready. Try again in a moment.' });
  }
  next();
}

router.use(ensureConnected);

router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).lean();
    res.json(reports.map((r) => ({ ...r, id: r._id.toString() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/reports/mine', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reports.map((r) => ({ ...r, id: r._id.toString() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ ...report, id: report._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reports', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, address, location, contact, severity, images } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title required' });
    }
    const report = await Report.create({
      title: title.trim(),
      description: description != null ? String(description).trim() : '',
      category: category != null ? String(category).trim() : '',
      address: address != null ? String(address).trim() : '',
      location: location && typeof location === 'object' ? location : {},
      contact: contact != null ? String(contact).trim() : '',
      severity: severity != null ? String(severity).trim() : '',
      images: Array.isArray(images) ? images : [],
      reportedBy: req.user.email,
      status: 'pending',
    });
    res.status(201).json({ ...report.toObject(), id: report._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).lean();
    res.json(issues.map((i) => ({ ...i, id: i._id.toString() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/issues/mine', authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(issues.map((i) => ({ ...i, id: i._id.toString() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).lean();
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ ...issue, id: issue._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/issues', authMiddleware, async (req, res) => {
  try {
    const { title, description, location } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title required' });
    }
    const issue = await Issue.create({
      title,
      description: description || '',
      location: location || '',
      reportedBy: req.user._id,
    });
    res.status(201).json({ ...issue.toObject(), id: issue._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/issues/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ ...issue, id: issue._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
