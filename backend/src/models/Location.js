/**
 * Location Model
 * MongoDB schema for location management
 */

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters'],
    index: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    trim: true,
    maxlength: [10, 'Zip code cannot exceed 10 characters']
  },
  country: {
    type: String,
    default: 'US',
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['Office', 'Branch', 'Retail', 'Corporate', 'Warehouse', 'Remote'],
    required: [true, 'Location type is required'],
    index: true
  },
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Capacity must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactPhone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[\d\s\-\(\)\.]+$/,
      'Please provide a valid phone number'
    ]
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false }
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  timezone: {
    type: String,
    default: 'UTC',
    trim: true
  },
  facilities: [{
    type: String,
    trim: true
  }],
  wifiSettings: {
    ssid: {
      type: String,
      trim: true,
      maxlength: [100, 'SSID cannot exceed 100 characters']
    },
    isWifiTrackingEnabled: {
      type: Boolean,
      default: false
    },
    wifiTrackingGracePeriod: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: [30, 'Grace period must be at least 30 seconds']
    },
    autoClockOutDelay: {
      type: Number,
      default: 60, // 1 minute in seconds
      min: [30, 'Auto clock out delay must be at least 30 seconds']
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
locationSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city, this.state, this.zipCode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for display name
locationSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.city})`;
});

// Additional indexes
locationSchema.index({ name: 1, city: 1 });
locationSchema.index({ type: 1, isActive: 1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ createdAt: -1 });

// Instance methods
locationSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentHours = this.operatingHours[dayOfWeek];
  
  if (!currentHours || currentHours.isClosed || !currentHours.open || !currentHours.close) {
    return false;
  }
  
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= currentHours.open && currentTime <= currentHours.close;
};

locationSchema.methods.getOperatingHoursToday = function() {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  return this.operatingHours[dayOfWeek];
};

locationSchema.methods.getTotalShifts = function() {
  const Shift = mongoose.model('Shift');
  return Shift.countDocuments({ locationId: this._id });
};

locationSchema.methods.getActiveShifts = function() {
  const Shift = mongoose.model('Shift');
  const now = new Date();
  return Shift.countDocuments({ 
    locationId: this._id,
    startTime: { $gte: now },
    status: { $in: ['AVAILABLE', 'BOOKED'] }
  });
};

// Static methods
locationSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('manager').sort({ name: 1 });
};

locationSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true }).populate('manager').sort({ name: 1 });
};

locationSchema.statics.findByManager = function(managerId) {
  return this.find({ manager: managerId, isActive: true }).sort({ name: 1 });
};

locationSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10) {
  // maxDistance in kilometers
  return this.find({
    'coordinates.latitude': {
      $gte: latitude - (maxDistance / 111), // 1 degree latitude ≈ 111km
      $lte: latitude + (maxDistance / 111)
    },
    'coordinates.longitude': {
      $gte: longitude - (maxDistance / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (maxDistance / (111 * Math.cos(latitude * Math.PI / 180)))
    },
    isActive: true
  }).sort({ name: 1 });
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location; 