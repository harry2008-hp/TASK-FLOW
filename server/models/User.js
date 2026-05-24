const mongoose = require('mongoose');
const { createDynamicModel } = require('./dbWrapper');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
  avatar: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = createDynamicModel('User', userSchema);
