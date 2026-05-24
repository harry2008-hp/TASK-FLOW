const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(protect);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

// Get list of all users (for assigning tasks)
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (err) {
    next(err);
  }
});

// Admin promotion / demotion route
router.put('/users/:id/role', restrictTo('Admin'), authController.updateUserRole);

module.exports = router;

