const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

// JWT Token Helper
const signToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'supersecret_taskflow_pro_key_12345', 
    { expiresIn: '7d' }
  );
};

// Log user activity helper
const logActivity = async (userId, action, details, targetId = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      targetId: String(targetId)
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password!', 400));
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email address is already in use.', 400));
    }

    // Salt-hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Default avatars matching the glassmorphic theme colors
    const avatarGradients = [
      'from-purple-500 to-indigo-500',
      'from-cyan-500 to-blue-500',
      'from-pink-500 to-rose-500',
      'from-emerald-500 to-teal-500',
    ];
    const randomAvatar = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    // If database is empty, make first user an Admin! This is a great development feature.
    const allUsers = await User.find({});
    const assignedRole = allUsers.length === 0 ? 'Admin' : (role || 'User');

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      avatar: randomAvatar,
    });

    // Remove password from response
    newUser.password = undefined;

    // Issue Token
    const token = signToken(newUser._id);

    // Log action
    await logActivity(newUser._id, 'User Registered', `Account created with email ${email}`, newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    next(err);
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // Find user and select password
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    // Verify password hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    // Remove password from response
    user.password = undefined;

    // Issue token
    const token = signToken(user._id);

    // Log action
    await logActivity(user._id, 'User Logged In', `Logged into the dashboard`, user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

// Get current profile context
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

// Update profile details
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, avatar } },
      { new: true, runValidators: true }
    );

    await logActivity(req.user._id, 'Profile Updated', 'Modified personal profile settings', req.user._id);

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
};

// Admin operation: update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['User', 'Admin'].includes(role)) {
      return next(new AppError('Please specify a valid role (User or Admin).', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    await logActivity(
      req.user._id, 
      'User Role Modified', 
      `Changed role of "${updatedUser.name}" to "${role}"`, 
      updatedUser._id
    );

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
};

