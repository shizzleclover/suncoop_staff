/**
 * User Model
 * MongoDB schema for user management
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    index: true,
    default: function() {
      // Generate employee ID: EMP + random 6-digit number
      return `EMP${Math.floor(100000 + Math.random() * 900000)}`;
    }
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    index: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  displayName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'US' },
    full: String
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  avatar: {
    type: String, // File path or URL
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false // Don't include in queries by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Staff approval system
  isApproved: {
    type: Boolean,
    default: function() {
      // Admins are auto-approved, staff need approval
      return this.role === 'admin';
    }
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Admins are auto-approved, staff start as pending
      return this.role === 'admin' ? 'approved' : 'pending';
    }
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
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Admin-specific fields
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  organizationName: {
    type: String,
    trim: true
  },
  organizationType: {
    type: String,
    trim: true
  },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' }
  },
  
  // Metadata
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    success: Boolean
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Additional indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Set display name
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }
  
  // Set full address
  if (this.isModified('address')) {
    this.address.full = this.fullAddress;
  }
  
  // Hash password if modified
  if (this.isModified('password')) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  
  next();
});

// Instance methods
userSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = uuidv4();
  
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = uuidv4();
  
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

userSchema.methods.updateLastLogin = function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  
  // Add to login history (keep last 50 entries)
  this.loginHistory.unshift({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success: true
  });
  
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(0, 50);
  }
  
  return this.save();
};

// Approval management methods
userSchema.methods.approve = function(approvedByUserId) {
  this.isApproved = true;
  this.approvalStatus = 'approved';
  this.approvedBy = approvedByUserId;
  this.approvedAt = new Date();
  this.rejectedReason = null;
  return this.save();
};

userSchema.methods.reject = function(reason, rejectedByUserId) {
  this.isApproved = false;
  this.approvalStatus = 'rejected';
  this.rejectedReason = reason;
  this.approvedBy = rejectedByUserId;
  this.approvedAt = null;
  return this.save();
};

userSchema.methods.isPendingApproval = function() {
  return this.approvalStatus === 'pending';
};

userSchema.methods.canLogin = function() {
  return this.isActive && (this.role === 'admin' || this.isApproved);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  // Remove sensitive fields
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.__v;
  
  return userObject;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin', isActive: true });
};

userSchema.statics.findStaff = function() {
  return this.find({ role: 'staff', isActive: true });
};

userSchema.statics.findPendingApproval = function() {
  return this.find({ 
    role: 'staff', 
    approvalStatus: 'pending',
    isActive: true 
  }).populate('createdBy', 'firstName lastName email');
};

userSchema.statics.findApprovedStaff = function() {
  return this.find({ 
    role: 'staff', 
    approvalStatus: 'approved',
    isActive: true 
  });
};

userSchema.statics.findRejectedStaff = function() {
  return this.find({ 
    role: 'staff', 
    approvalStatus: 'rejected' 
  }).populate('approvedBy', 'firstName lastName email');
};

const User = mongoose.model('User', userSchema);

module.exports = User; 