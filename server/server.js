const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');

// Load environment variables
dotenv.config();

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

// Use helmet for secure HTTP headers
app.use(helmet());

// Sanitize user-supplied data to prevent NoSQL injection
app.use(mongoSanitize());

const PORT = process.env.PORT || 5000;

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// If in production, restrict strictly to CLIENT_URL, otherwise allow all origins in dev
const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'production') {
      if (origin === clientUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies (capped at 10kb to prevent payload size abuse)
app.use(express.json({ limit: '10kb' }));

// Rate limiting on all task routes: 100 requests per 15 mins per IP
const taskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Logger middleware for request inspection
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint for monitoring & hosting services
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Task resource routes (protected by rate limiter)
app.use('/api/tasks', taskLimiter, taskRoutes);

// Catch-all 404 for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

// Establish MongoDB connection & startup the server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tasktracker';
    
    console.log('Connecting to MongoDB...');
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Critical Error: Failed to start the server:', error.message);
    process.exit(1);
  }
};

startServer();
