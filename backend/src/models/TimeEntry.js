/**
 * TimeEntry Model
 * MongoDB schema for time tracking
 */

const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null,
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  clockInTime: {
    type: Date,
    default: null
  },
  clockOutTime: {
    type: Date,
    default: null
  },
  hoursWorked: {
    type: Number,
    default: 0,
    min: [0, 'Hours worked cannot be negative']
  },
  breakTime: {
    type: Number,
    default: 0,
    min: [0, 'Break time cannot be negative']
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: [0, 'Overtime hours cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'clocked_in', 'completed'],
    default: 'pending',
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  clockInLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    address: String,
    formatted: String,
    geocoded: { type: Boolean, default: false }
  },
  clockOutLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    address: String,
    formatted: String,
    geocoded: { type: Boolean, default: false }
  },

  isLate: {
    type: Boolean,
    default: false
  },
  isEarlyLeave: {
    type: Boolean,
    default: false
  },
  payRate: {
    type: Number,
    default: 0,
    min: [0, 'Pay rate cannot be negative']
  },
  totalPay: {
    type: Number,
    default: 0,
    min: [0, 'Total pay cannot be negative']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculated hours worked
timeEntrySchema.virtual('calculatedHours').get(function() {
  if (this.clockInTime && this.clockOutTime) {
    const diffMs = this.clockOutTime - this.clockInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round((diffHours - this.breakTime) * 100) / 100; // Round to 2 decimal places
  }
  return this.hoursWorked || 0;
});

// Virtual for regular hours (non-overtime)
timeEntrySchema.virtual('regularHours').get(function() {
  const totalHours = this.calculatedHours;
  const maxRegular = 8; // Assuming 8 hours is regular
  return Math.min(totalHours, maxRegular);
});

// Virtual for status display
timeEntrySchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'clocked_in': 'Currently Working',
    'completed': 'Completed'
  };
  return statusMap[this.status] || this.status;
});

// Additional indexes
timeEntrySchema.index({ userId: 1, date: -1 });
timeEntrySchema.index({ locationId: 1, date: -1 });
timeEntrySchema.index({ status: 1, date: -1 });
timeEntrySchema.index({ date: -1 });
timeEntrySchema.index({ createdAt: -1 });

// Pre-save middleware
timeEntrySchema.pre('save', function(next) {
  // Calculate hours worked if clock in/out times are available
  if (this.clockInTime && this.clockOutTime) {
    const diffMs = this.clockOutTime - this.clockInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    this.hoursWorked = Math.round((diffHours - this.breakTime) * 100) / 100;
    
    // Calculate overtime (anything over 8 hours)
    if (this.hoursWorked > 8) {
      this.overtimeHours = this.hoursWorked - 8;
    }
    
    // Update status to completed if both times are set
    if (this.status === 'clocked_in') {
      this.status = 'completed';
    }
  }
  
  // Calculate total pay if pay rate is available
  if (this.payRate > 0) {
    const regularPay = this.regularHours * this.payRate;
    const overtimePay = this.overtimeHours * this.payRate * 1.5; // 1.5x for overtime
    this.totalPay = Math.round((regularPay + overtimePay) * 100) / 100;
  }
  
  next();
});

// Instance methods
timeEntrySchema.methods.clockIn = function(location = null) {
  if (this.clockInTime) {
    throw new Error('Already clocked in');
  }
  
  this.clockInTime = new Date();
  this.status = 'clocked_in';
  
  if (location) {
    this.clockInLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp || new Date(),
      address: location.address || null,
      formatted: location.formatted || null,
      geocoded: location.geocoded || false
    };
  }
  
  return this.save();
};

timeEntrySchema.methods.clockOut = function(location = null) {
  if (!this.clockInTime) {
    throw new Error('Must clock in first');
  }
  
  if (this.clockOutTime) {
    throw new Error('Already clocked out');
  }
  
  this.clockOutTime = new Date();
  
  if (location) {
    this.clockOutLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp || new Date(),
      address: location.address || null,
      formatted: location.formatted || null,
      geocoded: location.geocoded || false
    };
  }
  
  return this.save();
};

timeEntrySchema.methods.approve = function(adminId, adminNotes = '') {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  
  return this.save();
};

timeEntrySchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectedReason = reason;
  
  return this.save();
};

timeEntrySchema.methods.isCurrentlyWorking = function() {
  return this.status === 'clocked_in' && this.clockInTime && !this.clockOutTime;
};

// Static methods
timeEntrySchema.statics.findByUser = function(userId, fromDate = null, toDate = null) {
  const query = { userId };
  
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = fromDate;
    if (toDate) query.date.$lte = toDate;
  }
  
  return this.find(query).populate(['locationId', 'shiftId']).sort({ date: -1 });
};

timeEntrySchema.statics.findByLocation = function(locationId, fromDate = null, toDate = null) {
  const query = { locationId };
  
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = fromDate;
    if (toDate) query.date.$lte = toDate;
  }
  
  return this.find(query).populate(['userId', 'shiftId']).sort({ date: -1 });
};

timeEntrySchema.statics.findPendingApproval = function() {
  return this.find({ status: 'pending' })
    .populate(['userId', 'locationId', 'shiftId'])
    .sort({ date: -1 });
};

timeEntrySchema.statics.findCurrentlyWorking = function() {
  return this.find({ status: 'clocked_in' })
    .populate(['userId', 'locationId', 'shiftId'])
    .sort({ clockInTime: -1 });
};

timeEntrySchema.statics.getUserTotalHours = function(userId, fromDate, toDate) {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'approved',
        date: { $gte: fromDate, $lte: toDate }
      }
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: '$hoursWorked' },
        totalRegularHours: { $sum: '$regularHours' },
        totalOvertimeHours: { $sum: '$overtimeHours' },
        totalPay: { $sum: '$totalPay' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

module.exports = TimeEntry; 