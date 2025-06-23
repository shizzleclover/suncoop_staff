/**
 * Global Error Handler Middleware
 * Centralized error handling for Express app
 */

const logger = require('../utils/logger');

/**
 * Development error handler - includes stack trace
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      details: err
    }
  });
};

/**
 * Production error handler - clean error messages
 */
const sendErrorProd = (err, res) => {
  // Operational errors that are safe to send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message
      }
    });
  } else {
    // Programming or other unknown errors - don't leak details
    logger.error('ERROR:', err);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong!'
      }
    });
  }
};

/**
 * Handle MongoDB CastError
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
  const duplicateField = Object.keys(err.keyValue)[0];
  const value = err.keyValue[duplicateField];
  const message = `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} '${value}' already exists`;
  
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle MongoDB validation error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle JWT invalid token error
 */
const handleJWTError = () => {
  const error = new Error('Invalid token. Please log in again');
  error.statusCode = 401;
  error.isOperational = true;
  return error;
};

/**
 * Handle JWT expired token error
 */
const handleJWTExpiredError = () => {
  const error = new Error('Your token has expired. Please log in again');
  error.statusCode = 401;
  error.isOperational = true;
  return error;
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
  let message = 'File upload error';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large. Maximum size allowed is 5MB';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files. Maximum 5 files allowed';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field';
  }
  
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  logger.logError(err, req);

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(error);

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler; 