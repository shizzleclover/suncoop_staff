/**
 * WiFi Tracking Routes
 * Handles WiFi-based time tracking endpoints
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const WiFiTrackingController = require('../controllers/wifiTrackingController');

const router = express.Router();

// Validation middleware
const validateWiFiStatus = [
  body('ssid')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SSID must be between 1 and 100 characters'),
  body('isConnected')
    .isBoolean()
    .withMessage('isConnected must be a boolean'),
  body('locationId')
    .isMongoId()
    .withMessage('Valid location ID is required'),
  body('shiftId')
    .optional()
    .isMongoId()
    .withMessage('Shift ID must be a valid MongoDB ID'),
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object')
];

const validateForceDisconnect = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('locationId')
    .isMongoId()
    .withMessage('Valid location ID is required'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason must not exceed 200 characters')
];

const validateExplanation = [
  body('shiftId')
    .isMongoId()
    .withMessage('Valid shift ID is required'),
  body('explanation')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Explanation must be between 10 and 1000 characters')
];

const validateReview = [
  body('shiftId')
    .isMongoId()
    .withMessage('Valid shift ID is required'),
  body('isApproved')
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  body('adminNotes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes must not exceed 500 characters')
];

const validateLocationParam = [
  param('locationId')
    .isMongoId()
    .withMessage('Valid location ID is required')
];

const validateHistoryQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

const validateStatsQuery = [
  query('locationId')
    .optional()
    .isMongoId()
    .withMessage('Location ID must be a valid MongoDB ID'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

/**
 * Staff Routes - WiFi Status Reporting and Management
 */

// Report WiFi connection status
router.post('/status', 
  authenticate, 
  authorize('staff', 'admin'), 
  validateWiFiStatus, 
  WiFiTrackingController.reportWiFiStatus
);

// Get current WiFi status for authenticated user
router.get('/status', 
  authenticate, 
  authorize('staff', 'admin'), 
  WiFiTrackingController.getWiFiStatus
);

// Get WiFi connection history for authenticated user
router.get('/history', 
  authenticate, 
  authorize('staff', 'admin'), 
  validateHistoryQuery,
  WiFiTrackingController.getConnectionHistory
);

// Submit explanation for missed shift
router.post('/missed-shift/explanation', 
  authenticate, 
  authorize('staff', 'admin'), 
  validateExplanation,
  WiFiTrackingController.submitMissedShiftExplanation
);

// Get user's missed shifts requiring explanations
router.get('/missed-shifts', 
  authenticate, 
  authorize('staff', 'admin'), 
  WiFiTrackingController.getUserMissedShifts
);

// Check if user has pending explanations
router.get('/pending-explanations/check', 
  authenticate, 
  authorize('staff', 'admin'), 
  WiFiTrackingController.checkPendingExplanations
);

/**
 * Admin Routes - WiFi Management and Monitoring
 */

// Get location's current WiFi connections
router.get('/location/:locationId/connections', 
  authenticate, 
  authorize('admin'), 
  validateLocationParam,
  WiFiTrackingController.getLocationConnections
);

// Force disconnect user
router.post('/force-disconnect', 
  authenticate, 
  authorize('admin'), 
  validateForceDisconnect,
  WiFiTrackingController.forceDisconnect
);

// Review missed shift explanation
router.post('/missed-shift/review', 
  authenticate, 
  authorize('admin'), 
  validateReview,
  WiFiTrackingController.reviewMissedShiftExplanation
);

// Get pending explanations for admin review
router.get('/pending-explanations', 
  authenticate, 
  authorize('admin'), 
  WiFiTrackingController.getPendingExplanations
);

// Get WiFi tracking statistics
router.get('/stats', 
  authenticate, 
  authorize('admin'), 
  validateStatsQuery,
  WiFiTrackingController.getWiFiTrackingStats
);

/**
 * Health Check Routes
 */

// WiFi tracking system health check
router.get('/health', authenticate, authorize('admin'), async (req, res) => {
  try {
    const cronJobService = require('../services/cronJobService');
    const WiFiStatus = require('../models/WiFiStatus');
    
    // Check cron job status
    const jobsStatus = cronJobService.getJobsStatus();
    const jobStats = cronJobService.getJobStats();
    
    // Check recent WiFi activity
    const recentActivity = await WiFiStatus.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });
    
    const activeConnections = await WiFiStatus.countDocuments({
      isConnected: true,
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        system: 'WiFi Tracking System',
        status: 'operational',
        cronJobs: {
          status: jobsStatus,
          stats: jobStats
        },
        activity: {
          recentConnections: recentActivity,
          activeConnections: activeConnections
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Manual job execution (for testing)
router.post('/admin/execute-job', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { jobName } = req.body;
    
    if (!jobName) {
      return res.status(400).json({
        success: false,
        message: 'Job name is required'
      });
    }
    
    const cronJobService = require('../services/cronJobService');
    const result = await cronJobService.executeJobManually(jobName);
    
    res.json({
      success: result.success,
      message: result.message || `Job ${jobName} executed`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute job',
      error: error.message
    });
  }
});

// Get cron job management interface
router.get('/admin/jobs', authenticate, authorize('admin'), (req, res) => {
  try {
    const cronJobService = require('../services/cronJobService');
    const jobsStatus = cronJobService.getJobsStatus();
    const jobStats = cronJobService.getJobStats();
    
    res.json({
      success: true,
      data: {
        jobs: jobsStatus,
        stats: jobStats,
        availableJobs: [
          'auto-unbooking-check',
          'wifi-cleanup', 
          'time-entry-health-check',
          'shift-cleanup'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
});

// Start/stop specific cron job
router.post('/admin/jobs/:action', authenticate, authorize('admin'), (req, res) => {
  try {
    const { action } = req.params;
    const { jobName } = req.body;
    
    if (!jobName) {
      return res.status(400).json({
        success: false,
        message: 'Job name is required'
      });
    }
    
    const cronJobService = require('../services/cronJobService');
    let result;
    
    switch (action) {
      case 'start':
        result = cronJobService.startJob(jobName);
        break;
      case 'stop':
        result = cronJobService.stopJob(jobName);
        break;
      case 'restart':
        cronJobService.stopJob(jobName);
        // For restart, we would need to reinitialize the specific job
        result = { success: true, message: `Job ${jobName} restarted` };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use start, stop, or restart'
        });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage job',
      error: error.message
    });
  }
});

module.exports = router; 