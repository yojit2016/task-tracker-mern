/**
 * Centralized error handling middleware.
 * Ensures consistent JSON response structure: { success: false, message, errors? }
 */
const errorHandler = (err, req, res, next) => {
  // Log error stack trace for debugging
  console.error('Error occurred:', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors = err.errors || undefined;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => ({
      path: val.path,
      msg: val.message
    }));
  }

  // Handle Mongoose cast errors (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = errorHandler;
