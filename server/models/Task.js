const mongoose = require('mongoose');
const { createDynamicModel } = require('./dbWrapper');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  tags: {
    type: [String],
    default: [],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required'],
  }
}, {
  timestamps: true
});

module.exports = createDynamicModel('Task', taskSchema);
