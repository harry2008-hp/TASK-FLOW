const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const { connectDB, getDbMode } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Initialize express app
const app = express();

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Let React Devtools work easily
}));

// Setup CORS with localhost options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check and mode indicator
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    mode: getDbMode(),
    timestamp: new Date().toISOString()
  });
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

// Connect database then startup server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow Pro server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    console.log(`👉 API Status Healthcheck: http://localhost:${PORT}/api/status`);
  });
});
