/**
 * User Routes
 * User management endpoints
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', requireAdmin, usersController.getUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', usersController.getProfile);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', usersController.getUserStats);

/**
 * @route   GET /api/users/pending-approvals
 * @desc    Get pending staff approvals
 * @access  Private/Admin
 */
router.get('/pending-approvals', requireAdmin, usersController.getPendingApprovals);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', requireAdmin, usersController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user (admin only)
 * @access  Private/Admin
 */
router.post('/', requireAdmin, usersController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private/Admin
 */
router.put('/:id', requireAdmin, usersController.updateUser);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Deactivate user (admin only)
 * @access  Private/Admin
 */
router.post('/:id/deactivate', requireAdmin, usersController.deactivateUser);

/**
 * @route   POST /api/users/:id/reactivate
 * @desc    Reactivate user (admin only)
 * @access  Private/Admin
 */
router.post('/:id/reactivate', requireAdmin, usersController.reactivateUser);

/**
 * @route   POST /api/users/:id/approve
 * @desc    Approve staff member
 * @access  Private/Admin
 */
router.post('/:id/approve', requireAdmin, usersController.approveStaff);

/**
 * @route   POST /api/users/:id/reject
 * @desc    Reject staff member
 * @access  Private/Admin
 */
router.post('/:id/reject', requireAdmin, usersController.rejectStaff);

/**
 * @route   DELETE /api/users/:id
 * @desc    Permanently delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', requireAdmin, usersController.deleteUser);

module.exports = router; 