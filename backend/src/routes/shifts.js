/**
 * Shift Routes
 * Shift management endpoints
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const shiftsController = require('../controllers/shiftsController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/shifts
 * @desc    Get all shifts with pagination and filters
 * @access  Private/Admin
 */
router.get('/', requireAdmin, shiftsController.getShifts);

/**
 * @route   GET /api/shifts/available
 * @desc    Get available shifts
 * @access  Private
 */
router.get('/available', shiftsController.getAvailableShifts);

/**
 * @route   GET /api/shifts/my-shifts
 * @desc    Get current user's shifts
 * @access  Private
 */
router.get('/my-shifts', shiftsController.getUserShifts);

/**
 * @route   GET /api/shifts/:id
 * @desc    Get shift by ID
 * @access  Private
 */
router.get('/:id', shiftsController.getShiftById);

/**
 * @route   POST /api/shifts
 * @desc    Create new shift
 * @access  Private/Admin
 */
router.post('/', requireAdmin, shiftsController.createShift);

/**
 * @route   PUT /api/shifts/:id
 * @desc    Update shift
 * @access  Private/Admin
 */
router.put('/:id', requireAdmin, shiftsController.updateShift);

/**
 * @route   POST /api/shifts/:id/assign
 * @desc    Assign user to shift
 * @access  Private
 */
router.post('/:id/assign', shiftsController.assignShift);

/**
 * @route   POST /api/shifts/:id/unassign
 * @desc    Unassign user from shift
 * @access  Private
 */
router.post('/:id/unassign', shiftsController.unassignShift);

/**
 * @route   DELETE /api/shifts/clear-all
 * @desc    Clear all shifts (admin only)
 * @access  Private/Admin
 */
router.delete('/clear-all', requireAdmin, shiftsController.clearAllShifts);

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift
 * @access  Private/Admin
 */
router.delete('/:id', requireAdmin, shiftsController.deleteShift);

module.exports = router; 