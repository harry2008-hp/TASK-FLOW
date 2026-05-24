const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Middleware to verify JWT and attach user context
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to gain access.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_taskflow_pro_key_12345');
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }

    // Fetch user from DB/Fallback JSON file
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to restrict access to specific roles (e.g. Admin)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  }
};
