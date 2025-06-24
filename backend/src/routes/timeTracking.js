/**
 * Time Tracking Routes
 * Time entry and clock in/out endpoints
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const timeTrackingController = require('../controllers/timeTrackingController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/time-entries
 * @desc    Get time entries with pagination and filters
 * @access  Private/Admin
 */
router.get('/', requireAdmin, timeTrackingController.getTimeEntries);

/**
 * @route   GET /api/time-entries/my-entries
 * @desc    Get current user's time entries
 * @access  Private
 */
router.get('/my-entries', timeTrackingController.getTimeEntries);

/**
 * @route   GET /api/time-entries/pending
 * @desc    Get time entries pending approval
 * @access  Private/Admin
 */
router.get('/pending', requireAdmin, timeTrackingController.getPendingApprovals);

/**
 * @route   GET /api/time-entries/currently-working
 * @desc    Get currently working users
 * @access  Private/Admin
 */
router.get('/currently-working', requireAdmin, timeTrackingController.getCurrentlyWorking);

/**
 * @route   GET /api/time-entries/summary
 * @desc    Get time entries summary
 * @access  Private
 */
router.get('/summary', timeTrackingController.getTimeSummary);

/**
 * @route   GET /api/time-entries/wifi-check/:locationId
 * @desc    Check WiFi requirements for clock in/out
 * @access  Private
 */
router.get('/wifi-check/:locationId', timeTrackingController.checkWiFiRequirements);

/**
 * @route   GET /api/time-entries/:id
 * @desc    Get time entry by ID
 * @access  Private
 */
router.get('/:id', timeTrackingController.getTimeEntryById);

/**
 * @route   POST /api/time-entries
 * @desc    Create new time entry
 * @access  Private
 */
router.post('/', timeTrackingController.createTimeEntry);

/**
 * @route   POST /api/time-entries/clock-in
 * @desc    Clock in to shift
 * @access  Private
 */
router.post('/clock-in', timeTrackingController.clockIn);

/**
 * @route   POST /api/time-entries/clock-out
 * @desc    Clock out from shift
 * @access  Private
 */
router.post('/clock-out', timeTrackingController.clockOut);

/**
 * @route   POST /api/time-entries/:id/approve
 * @desc    Approve time entry
 * @access  Private/Admin
 */
router.post('/:id/approve', requireAdmin, timeTrackingController.approveTimeEntry);

/**
 * @route   POST /api/time-entries/:id/reject
 * @desc    Reject time entry
 * @access  Private/Admin
 */
router.post('/:id/reject', requireAdmin, timeTrackingController.rejectTimeEntry);

/**
 * @route   PUT /api/time-entries/:id
 * @desc    Update time entry
 * @access  Private/Admin
 */
router.put('/:id', requireAdmin, timeTrackingController.updateTimeEntry);

module.exports = router; 