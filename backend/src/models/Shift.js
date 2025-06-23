/**
 * Shift Model
 * MongoDB schema for shift management
 */

const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required'],
    index: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'AVAILABLE',
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  maxCapacity: {
    type: Number,
    default: 1,
    min: [1, 'Max capacity must be at least 1']
  },
  currentCapacity: {
    type: Number,
    default: 0,
    min: [0, 'Current capacity cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    default: null
  },
  parentShift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in hours
shiftSchema.virtual('durationHours').get(function() {
  if (this.startTime && this.endTime) {
    return (this.endTime - this.startTime) / (1000 * 60 * 60);
  }
  return 0;
});

// Virtual for shift date
shiftSchema.virtual('shiftDate').get(function() {
  return this.startTime ? this.startTime.toDateString() : null;
});

// Additional indexes
shiftSchema.index({ startTime: 1, endTime: 1 });
shiftSchema.index({ status: 1, startTime: 1 });
shiftSchema.index({ createdAt: -1 });

// Pre-save middleware
shiftSchema.pre('save', function(next) {
  // Validate end time is after start time
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Update current capacity based on assignment
  if (this.assignedTo) {
    this.currentCapacity = Math.min(this.currentCapacity + 1, this.maxCapacity);
    if (this.status === 'AVAILABLE') {
      this.status = 'BOOKED';
    }
  } else {
    this.currentCapacity = 0;
    if (this.status === 'BOOKED') {
      this.status = 'AVAILABLE';
    }
  }
  
  next();
});

// Instance methods
shiftSchema.methods.isAvailable = function() {
  return this.status === 'AVAILABLE' && !this.assignedTo && this.startTime > new Date();
};

shiftSchema.methods.isInPast = function() {
  return this.endTime < new Date();
};

shiftSchema.methods.isToday = function() {
  const today = new Date();
  const shiftDate = new Date(this.startTime);
  return shiftDate.toDateString() === today.toDateString();
};

shiftSchema.methods.assignUser = function(userId) {
  if (this.assignedTo) {
    throw new Error('Shift is already assigned');
  }
  
  if (this.isInPast()) {
    throw new Error('Cannot assign user to past shift');
  }
  
  this.assignedTo = userId;
  this.status = 'BOOKED';
  this.currentCapacity = 1;
  
  return this.save();
};

shiftSchema.methods.unassignUser = function() {
  this.assignedTo = null;
  this.status = 'AVAILABLE';
  this.currentCapacity = 0;
  
  return this.save();
};

// Static methods
shiftSchema.statics.findAvailable = function(fromDate = new Date()) {
  return this.find({
    status: 'AVAILABLE',
    assignedTo: null,
    startTime: { $gte: fromDate }
  }).populate('locationId').sort({ startTime: 1 });
};

shiftSchema.statics.findByUser = function(userId, fromDate = null) {
  const query = { assignedTo: userId };
  if (fromDate) {
    query.startTime = { $gte: fromDate };
  }
  return this.find(query).populate('locationId').sort({ startTime: 1 });
};

shiftSchema.statics.findByLocation = function(locationId, fromDate = new Date()) {
  return this.find({
    locationId,
    startTime: { $gte: fromDate }
  }).populate('assignedTo').sort({ startTime: 1 });
};

shiftSchema.statics.findUpcoming = function(hours = 24) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return this.find({
    startTime: { $gte: now, $lte: futureTime },
    status: 'BOOKED'
  }).populate(['assignedTo', 'locationId']);
};

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift; 