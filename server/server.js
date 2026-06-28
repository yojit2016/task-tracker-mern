const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// If in production, restrict to CLIENT_URL, otherwise allow all origins in dev
const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'production') {
      if (origin === clientUrl || !origin) {
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

// Middleware to parse JSON bodies
app.use(express.json());

// Logger middleware for request inspection
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint for monitoring & hosting services
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Task resource routes
app.use('/api/tasks', taskRoutes);

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
