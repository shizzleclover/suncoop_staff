/**
 * Notification Routes
 * Notification management endpoints
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', notificationsController.getNotifications);

/**
 * @route   GET /api/notifications/all
 * @desc    Get all notifications (admin only)
 * @access  Private/Admin
 */
router.get('/all', requireAdmin, notificationsController.getNotifications);

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get('/unread', notificationsController.getUnreadCount);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id', notificationsController.getNotificationById);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (admin only)
 * @access  Private/Admin
 */
router.post('/', requireAdmin, notificationsController.createNotification);

/**
 * @route   POST /api/notifications/broadcast
 * @desc    Broadcast notification to all users (admin only)
 * @access  Private/Admin
 */
router.post('/broadcast', requireAdmin, notificationsController.broadcastNotification);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', notificationsController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all user notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationsController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', notificationsController.deleteNotification);

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Cleanup old notifications (admin only)
 * @access  Private/Admin
 */
router.delete('/cleanup', requireAdmin, notificationsController.cleanupNotifications);

module.exports = router; 