/**
 * Location Routes
 * Location management endpoints
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const locationsController = require('../controllers/locationsController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/locations
 * @desc    Get all locations with pagination and filters
 * @access  Private
 */
router.get('/', locationsController.getLocations);

/**
 * @route   GET /api/locations/active
 * @desc    Get active locations
 * @access  Private
 */
router.get('/active', locationsController.getActiveLocations);

/**
 * @route   GET /api/locations/nearby
 * @desc    Get nearby locations
 * @access  Private
 */
router.get('/nearby', locationsController.getNearbyLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Private
 */
router.get('/:id', locationsController.getLocationById);

/**
 * @route   GET /api/locations/:id/shifts
 * @desc    Get location shifts
 * @access  Private
 */
router.get('/:id/shifts', locationsController.getLocationShifts);

/**
 * @route   GET /api/locations/:id/stats
 * @desc    Get location statistics
 * @access  Private/Admin
 */
router.get('/:id/stats', requireAdmin, locationsController.getLocationStats);

/**
 * @route   POST /api/locations
 * @desc    Create new location
 * @access  Private/Admin
 */
router.post('/', requireAdmin, locationsController.createLocation);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update location
 * @access  Private/Admin
 */
router.put('/:id', requireAdmin, locationsController.updateLocation);

/**
 * @route   POST /api/locations/:id/deactivate
 * @desc    Deactivate location
 * @access  Private/Admin
 */
router.post('/:id/deactivate', requireAdmin, locationsController.deactivateLocation);

/**
 * @route   POST /api/locations/:id/activate
 * @desc    Activate location
 * @access  Private/Admin
 */
router.post('/:id/activate', requireAdmin, locationsController.activateLocation);

module.exports = router; 