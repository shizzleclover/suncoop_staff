/**
 * Notifications Controller
 * Handle notification management operations
 */

const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { emitNotification } = require('../socket');

/**
 * Get user's notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
      priority
    } = req.query;

    const options = {
      unreadOnly: unreadOnly === 'true',
      type,
      priority,
      limit: parseInt(limit)
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.findByUser(req.user.id, options)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      userId: req.user.id,
      ...(options.unreadOnly && { isRead: false }),
      ...(options.type && { type: options.type }),
      ...(options.priority && { priority: options.priority })
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalNotifications: total,
          hasNextPage: skip + notifications.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve notifications'
      }
    });
  }
};

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Notification not found'
        }
      });
    }

    // Check if notification belongs to current user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only view your own notifications'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        notification
      }
    });

  } catch (error) {
    logger.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve notification'
      }
    });
  }
};

/**
 * Create notification (admin only)
 * POST /api/notifications
 */
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type = 'general',
      title,
      message,
      priority = 'normal',
      category = 'info',
      data = {},
      actionUrl,
      actionText,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID, title, and message are required'
        }
      });
    }

    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority,
      category,
      data,
      actionUrl,
      actionText,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    // Emit real-time notification
    emitNotification(userId, notification);

    logger.info(`Notification created: ${notification._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification
      }
    });

  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create notification'
      }
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Notification not found'
        }
      });
    }

    // Check if notification belongs to current user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own notifications'
        }
      });
    }

    // Mark as read
    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    });

  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark notification as read'
      }
    });
  }
};

/**
 * Mark notification as unread
 * PUT /api/notifications/:id/unread
 */
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Notification not found'
        }
      });
    }

    // Check if notification belongs to current user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own notifications'
        }
      });
    }

    // Mark as unread
    await notification.markAsUnread();

    res.status(200).json({
      success: true,
      message: 'Notification marked as unread',
      data: {
        notification
      }
    });

  } catch (error) {
    logger.error('Mark as unread error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark notification as unread'
      }
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/mark-all-read
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    logger.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark all notifications as read'
      }
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Notification not found'
        }
      });
    }

    // Check if notification belongs to current user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only delete your own notifications'
        }
      });
    }

    // Check if notification can be deleted
    if (!notification.canDelete()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Notification cannot be deleted yet'
        }
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete notification'
      }
    });
  }
};

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count
      }
    });

  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get unread count'
      }
    });
  }
};

/**
 * Broadcast notification to all users (admin only)
 * POST /api/notifications/broadcast
 */
const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'system_announcement',
      priority = 'normal',
      category = 'info',
      targetRole, // 'admin', 'staff', or null for all
      actionUrl,
      actionText,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Title and message are required'
        }
      });
    }

    // Get target users
    const User = require('../models/User');
    const filter = { isActive: true };
    if (targetRole) {
      filter.role = targetRole;
    }

    const users = await User.find(filter).select('_id');

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          userId: user._id,
          type,
          title,
          message,
          priority,
          category,
          actionUrl,
          actionText,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        })
      )
    );

    // Emit real-time notifications
    notifications.forEach(notification => {
      emitNotification(notification.userId, notification);
    });

    logger.info(`Broadcast notification sent to ${notifications.length} users by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      data: {
        notificationCount: notifications.length,
        targetRole: targetRole || 'all'
      }
    });

  } catch (error) {
    logger.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to broadcast notification'
      }
    });
  }
};

/**
 * Clean up old notifications (admin only)
 * DELETE /api/notifications/cleanup
 */
const cleanupNotifications = async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;

    // Delete expired notifications
    const expiredResult = await Notification.deleteExpired();
    
    // Delete old read notifications
    const oldReadResult = await Notification.deleteOldRead(parseInt(daysOld));

    const totalDeleted = expiredResult.deletedCount + oldReadResult.deletedCount;

    logger.info(`Notification cleanup: ${totalDeleted} notifications deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `${totalDeleted} notifications cleaned up`,
      data: {
        expiredDeleted: expiredResult.deletedCount,
        oldReadDeleted: oldReadResult.deletedCount,
        totalDeleted
      }
    });

  } catch (error) {
    logger.error('Cleanup notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to cleanup notifications'
      }
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  broadcastNotification,
  cleanupNotifications
}; 