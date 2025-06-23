/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validate request and return errors if any
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation errors:', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formattedErrors
      }
    });
  }
  
  next();
};

module.exports = {
  validateRequest
}; 