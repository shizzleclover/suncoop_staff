/**
 * Reports Routes
 * Reporting and analytics endpoints
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/reports
 * @desc    Get reports
 * @access  Private
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reports endpoint - coming soon',
    data: []
  });
});

module.exports = router; 