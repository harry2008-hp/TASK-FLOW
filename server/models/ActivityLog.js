const mongoose = require('mongoose');
const { createDynamicModel } = require('./dbWrapper');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  targetId: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = createDynamicModel('ActivityLog', activityLogSchema);
