const mongoose = require('../db');

const reportSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  location: { type: mongoose.Schema.Types.Mixed, default: {} },
  address: { type: String, default: '' },
  images: { type: [String], default: [] },
  reportedBy: { type: String, default: '' },
  contact: { type: String, default: '' },
  severity: { type: String, default: '' },
}, { timestamps: true, collection: 'reports' });

module.exports = mongoose.model('Report', reportSchema);
