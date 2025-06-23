/**
 * Notification Model
 * MongoDB schema for notification management
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  type: {
    type: String,
    enum: [
      'shift_reminder',
      'shift_assigned',
      'shift_cancelled',
      'shift_updated',
      'time_entry_approved',
      'time_entry_rejected',
      'penalty_applied',
      'password_reset',
      'account_created',
      'system_announcement',
      'location_update',
      'general'
    ],
    required: [true, 'Notification type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedEntityType: {
    type: String,
    enum: ['shift', 'timeEntry', 'user', 'location', 'system'],
    default: null
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  expiresAt: {
    type: Date,
    default: null
  },
  sentVia: [{
    type: String,
    enum: ['app', 'email', 'sms', 'push']
  }],
  metadata: {
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
    smsSent: { type: Boolean, default: false },
    smsSentAt: { type: Date, default: null },
    pushSent: { type: Boolean, default: false },
    pushSentAt: { type: Date, default: null }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Virtual for display icon
notificationSchema.virtual('icon').get(function() {
  const iconMap = {
    'shift_reminder': 'clock',
    'shift_assigned': 'calendar-plus',
    'shift_cancelled': 'calendar-x',
    'shift_updated': 'calendar-edit',
    'time_entry_approved': 'check-circle',
    'time_entry_rejected': 'x-circle',
    'penalty_applied': 'alert-triangle',
    'password_reset': 'key',
    'account_created': 'user-plus',
    'system_announcement': 'megaphone',
    'location_update': 'map-pin',
    'general': 'bell'
  };
  
  return iconMap[this.type] || 'bell';
});

// Additional indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set readAt timestamp when marking as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  next();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

notificationSchema.methods.canDelete = function() {
  // Allow deletion if read and older than 30 days, or expired
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return (this.isRead && this.createdAt < thirtyDaysAgo) || this.isExpired();
};

// Static methods
notificationSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.unreadOnly) {
    query.isRead = false;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.deleteExpired = function() {
  const now = new Date();
  return this.deleteMany({ expiresAt: { $lt: now } });
};

notificationSchema.statics.deleteOldRead = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoffDate }
  });
};

notificationSchema.statics.createShiftReminder = function(userId, shiftData) {
  return this.create({
    userId,
    type: 'shift_reminder',
    title: 'Shift Reminder',
    message: `You have a shift starting at ${new Date(shiftData.startTime).toLocaleTimeString()} at ${shiftData.locationName}`,
    priority: 'high',
    category: 'info',
    data: { shiftId: shiftData.shiftId },
    relatedEntityType: 'shift',
    relatedEntityId: shiftData.shiftId,
    actionUrl: `/staff/shifts/${shiftData.shiftId}`,
    actionText: 'View Shift'
  });
};

notificationSchema.statics.createShiftAssignment = function(userId, shiftData) {
  return this.create({
    userId,
    type: 'shift_assigned',
    title: 'New Shift Assigned',
    message: `You have been assigned to a shift at ${shiftData.locationName} on ${new Date(shiftData.startTime).toLocaleDateString()}`,
    priority: 'normal',
    category: 'success',
    data: { shiftId: shiftData.shiftId },
    relatedEntityType: 'shift',
    relatedEntityId: shiftData.shiftId,
    actionUrl: `/staff/shifts/${shiftData.shiftId}`,
    actionText: 'View Shift'
  });
};

notificationSchema.statics.createTimeEntryApproval = function(userId, timeEntryData, approved = true) {
  return this.create({
    userId,
    type: approved ? 'time_entry_approved' : 'time_entry_rejected',
    title: approved ? 'Time Entry Approved' : 'Time Entry Rejected',
    message: approved 
      ? `Your time entry for ${timeEntryData.hoursWorked} hours has been approved`
      : `Your time entry has been rejected. Reason: ${timeEntryData.rejectedReason}`,
    priority: 'normal',
    category: approved ? 'success' : 'warning',
    data: { timeEntryId: timeEntryData.timeEntryId },
    relatedEntityType: 'timeEntry',
    relatedEntityId: timeEntryData.timeEntryId,
    actionUrl: `/staff/time-tracking`,
    actionText: 'View Time Entries'
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 