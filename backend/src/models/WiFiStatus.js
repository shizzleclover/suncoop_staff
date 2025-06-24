/**
 * WiFiStatus Model
 * MongoDB schema for tracking user WiFi connectivity status
 */

const mongoose = require('mongoose');

const wifiStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required'],
    index: true
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null,
    index: true
  },
  ssid: {
    type: String,
    required: [true, 'SSID is required'],
    trim: true,
    index: true
  },
  isConnected: {
    type: Boolean,
    required: true,
    index: true
  },
  connectionTime: {
    type: Date,
    required: true,
    index: true
  },
  disconnectionTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    ipAddress: String
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  autoActions: [{
    action: {
      type: String,
      enum: ['auto_clock_in', 'auto_clock_out', 'shift_reminder', 'connection_alert'],
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    timeEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeEntry'
    },
    result: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      required: true
    },
    details: String
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for connection duration in minutes
wifiStatusSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration / 60);
});

// Virtual for current session duration
wifiStatusSchema.virtual('currentSessionDuration').get(function() {
  if (this.isConnected && this.connectionTime) {
    const now = new Date();
    return Math.round((now - this.connectionTime) / 1000); // in seconds
  }
  return this.duration || 0;
});

// Additional indexes
wifiStatusSchema.index({ userId: 1, isConnected: 1 });
wifiStatusSchema.index({ locationId: 1, isConnected: 1 });
wifiStatusSchema.index({ ssid: 1, isConnected: 1 });
wifiStatusSchema.index({ connectionTime: -1 });
wifiStatusSchema.index({ userId: 1, connectionTime: -1 });

// Pre-save middleware
wifiStatusSchema.pre('save', function(next) {
  // Calculate duration if disconnecting
  if (!this.isConnected && this.connectionTime && this.disconnectionTime) {
    this.duration = Math.round((this.disconnectionTime - this.connectionTime) / 1000);
  }
  
  next();
});

// Instance methods
wifiStatusSchema.methods.disconnect = function() {
  if (!this.isConnected) {
    throw new Error('Already disconnected');
  }
  
  this.isConnected = false;
  this.disconnectionTime = new Date();
  this.duration = Math.round((this.disconnectionTime - this.connectionTime) / 1000);
  
  return this.save();
};

wifiStatusSchema.methods.addAutoAction = function(action, result, details = null, timeEntryId = null) {
  this.autoActions.push({
    action,
    timestamp: new Date(),
    timeEntryId,
    result,
    details
  });
  
  return this.save();
};

// Static methods
wifiStatusSchema.statics.findCurrentConnections = function(userId = null) {
  const query = { isConnected: true, isActive: true };
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query)
    .populate(['userId', 'locationId', 'shiftId'])
    .sort({ connectionTime: -1 });
};

wifiStatusSchema.statics.findByUserAndLocation = function(userId, locationId, isConnected = null) {
  const query = { userId, locationId, isActive: true };
  if (isConnected !== null) {
    query.isConnected = isConnected;
  }
  
  return this.find(query)
    .populate(['locationId', 'shiftId'])
    .sort({ connectionTime: -1 });
};

wifiStatusSchema.statics.getUserConnectionHistory = function(userId, days = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return this.find({
    userId,
    connectionTime: { $gte: fromDate },
    isActive: true
  })
  .populate(['locationId', 'shiftId'])
  .sort({ connectionTime: -1 });
};

wifiStatusSchema.statics.getLocationConnections = function(locationId, isConnected = true) {
  return this.find({
    locationId,
    isConnected,
    isActive: true
  })
  .populate(['userId', 'shiftId'])
  .sort({ connectionTime: -1 });
};

wifiStatusSchema.statics.createConnection = function(data) {
  return this.create({
    userId: data.userId,
    locationId: data.locationId,
    shiftId: data.shiftId || null,
    ssid: data.ssid,
    isConnected: true,
    connectionTime: new Date(),
    deviceInfo: data.deviceInfo || {},
    location: data.location || {}
  });
};

const WiFiStatus = mongoose.model('WiFiStatus', wifiStatusSchema);

module.exports = WiFiStatus; 