# SunCoop Staff Management - Backend API Specification

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Request/Response Formats](#requestresponse-formats)
7. [Business Logic & Validation Rules](#business-logic--validation-rules)
8. [Real-time Features](#real-time-features)
9. [Setup Instructions](#setup-instructions)

---

## System Overview

The SunCoop Staff Management System is a comprehensive workforce management platform with role-based access control, time tracking, shift management, and analytics capabilities.

### User Roles
- **Admin**: Full system access, user management, reports, settings
- **Staff**: Personal dashboard, shift booking, time tracking, profile management

---

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Storage**: GridFS or cloud storage (AWS S3/Cloudinary)
- **Email**: Nodemailer or SendGrid
- **SMS**: Twilio (optional)

---

## Database Models

### 1. Users Collection
```javascript
const userSchema = {
  _id: ObjectId,
  employeeId: String, // Auto-generated unique ID
  username: String, // Unique
  email: String, // Unique, required
  password: String, // Hashed with bcrypt
  firstName: String, // Required
  lastName: String, // Required
  displayName: String, // Auto-generated: firstName + lastName
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  phone: String,
  address: String,
  department: String,
  avatar: String, // File path or URL
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId, // Reference to admin who created this user
  
  // Admin-specific fields
  isSuperAdmin: Boolean,
  organizationName: String,
  organizationType: String,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date
}
```

### 2. Shifts Collection
```javascript
const shiftSchema = {
  _id: ObjectId,
  title: String, // Required
  description: String,
  locationId: ObjectId, // Reference to Location
  startTime: Date, // Required
  endTime: Date, // Required
  duration: Number, // Calculated in hours
  capacity: {
    type: Number,
    default: 1
  },
  bookedCount: {
    type: Number,
    default: 0
  },
  hourlyRate: Number, // Pay rate per hour
  totalPay: Number, // Calculated: duration * hourlyRate
  requirements: [String], // Skills or requirements needed
  status: {
    type: String,
    enum: ['available', 'booked', 'in_progress', 'completed', 'cancelled'],
    default: 'available'
  },
  assignedTo: [ObjectId], // Array of User IDs
  bookedBy: [ObjectId], // Array of User IDs who booked
  bookedAt: [Date], // Corresponding booking timestamps
  createdBy: ObjectId, // Admin who created the shift
  createdAt: Date,
  updatedAt: Date,
  
  // Cancellation tracking
  cancelledBy: ObjectId,
  cancelledAt: Date,
  cancellationReason: String
}
```

### 3. TimeEntries Collection
```javascript
const timeEntrySchema = {
  _id: ObjectId,
  userId: ObjectId, // Required, reference to User
  shiftId: ObjectId, // Required, reference to Shift
  
  // Clock in data
  clockInTime: Date, // Required
  clockInLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number
  },
  clockInWifiNetwork: String,
  clockInDeviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  
  // Clock out data
  clockOutTime: Date,
  clockOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number
  },
  clockOutWifiNetwork: String,
  clockOutDeviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  
  // Calculated fields
  hoursWorked: Number, // Calculated on clock out
  totalPay: Number, // hoursWorked * hourlyRate
  
  status: {
    type: String,
    enum: ['clocked_in', 'clocked_out', 'break', 'approved', 'disputed'],
    default: 'clocked_in'
  },
  
  // Break tracking
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number,
    reason: String
  }],
  totalBreakTime: Number,
  
  // Admin approval
  approvedBy: ObjectId,
  approvedAt: Date,
  
  // Dispute handling
  isDisputed: Boolean,
  disputeReason: String,
  disputedAt: Date,
  
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Locations Collection
```javascript
const locationSchema = {
  _id: ObjectId,
  name: String, // Required
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    full: String // Complete address
  },
  coordinates: {
    latitude: Number, // Required
    longitude: Number, // Required
  },
  verificationRadius: {
    type: Number,
    default: 50 // meters
  },
  wifiNetworks: [String], // Allowed WiFi network names for verification
  contactInfo: {
    phone: String,
    email: String,
    manager: String
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Notifications Collection
```javascript
const notificationSchema = {
  _id: ObjectId,
  userId: ObjectId, // Recipient
  type: {
    type: String,
    enum: ['shift_reminder', 'shift_cancelled', 'clock_in_reminder', 'approval_needed', 'system_update', 'general'],
    required: true
  },
  title: String, // Required
  message: String, // Required
  data: {}, // Additional data (shift info, etc.)
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  deliveryChannels: {
    inApp: Boolean,
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  scheduledFor: Date, // For scheduled notifications
  sentAt: Date,
  createdBy: ObjectId,
  createdAt: Date
}
```

### 6. Settings Collection
```javascript
const settingsSchema = {
  _id: ObjectId,
  category: {
    type: String,
    enum: ['business_rules', 'notifications', 'security', 'integrations', 'general'],
    required: true
  },
  key: String, // Setting identifier
  value: {}, // Setting value (can be any type)
  displayName: String,
  description: String,
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array']
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  updatedBy: ObjectId,
  updatedAt: Date,
  createdAt: Date
}
```

### 7. AuditLogs Collection
```javascript
const auditLogSchema = {
  _id: ObjectId,
  userId: ObjectId, // Who performed the action
  action: String, // What was done
  resource: String, // What was affected (user, shift, etc.)
  resourceId: ObjectId, // ID of affected resource
  oldData: {}, // Previous state
  newData: {}, // New state
  ipAddress: String,
  userAgent: String,
  timestamp: Date,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  }
}
```

### 8. Files Collection
```javascript
const fileSchema = {
  _id: ObjectId,
  originalName: String,
  filename: String, // Stored filename
  mimetype: String,
  size: Number,
  path: String, // Storage path
  uploadedBy: ObjectId,
  associatedWith: {
    type: String, // user, shift, document, etc.
    id: ObjectId
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  uploadedAt: Date
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Initial admin setup for new system
```javascript
// Request Body
{
  "organizationName": "SunCoop Management",
  "organizationType": "Staff Management",
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@suncoop.com",
  "username": "admin",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "phone": "+1-555-123-4567"
}

// Response (201 Created)
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "admin@suncoop.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "isSuperAdmin": true
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /api/auth/login
```javascript
// Request Body
{
  "identifier": "admin@suncoop.com", // email or username
  "password": "SecurePassword123!"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "admin@suncoop.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "lastLogin": "2024-01-20T10:30:00Z"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 86400
  }
}
```

#### POST /api/auth/forgot-password
```javascript
// Request Body
{
  "email": "user@suncoop.com"
}

// Response (200 OK)
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

#### POST /api/auth/reset-password
```javascript
// Request Body
{
  "token": "reset_token",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}

// Response (200 OK)
{
  "success": true,
  "message": "Password reset successful"
}
```

### User Management Endpoints

#### GET /api/users
**Auth Required**: Admin only
```javascript
// Query Parameters
{
  "page": 1,
  "limit": 10,
  "role": "staff", // Optional filter
  "status": "active", // active, inactive, all
  "search": "john", // Search in name/email
  "sortBy": "createdAt",
  "sortOrder": "desc"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@suncoop.com",
        "role": "staff",
        "department": "Operations",
        "isActive": true,
        "createdAt": "2024-01-15T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /api/users
**Auth Required**: Admin only
```javascript
// Request Body
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@suncoop.com",
  "phone": "+1-555-234-5678",
  "role": "staff",
  "department": "Operations",
  "address": "123 Main St, City, State"
}

// Response (201 Created)
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "new_user_id",
      "employeeId": "EMP049",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@suncoop.com",
      "role": "staff",
      "isActive": true
    },
    "temporaryPassword": "TempPass123!" // Send via email
  }
}
```

### Shift Management Endpoints

#### GET /api/shifts
```javascript
// Query Parameters
{
  "page": 1,
  "limit": 20,
  "status": "available", // available, booked, completed, cancelled, all
  "locationId": "location_id", // Optional filter
  "startDate": "2024-01-20", // YYYY-MM-DD
  "endDate": "2024-01-27",
  "assignedTo": "user_id", // Optional filter
  "sortBy": "startTime",
  "sortOrder": "asc"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": "shift_id",
        "title": "Morning Shift",
        "description": "Customer service duties",
        "location": {
          "id": "location_id",
          "name": "Downtown Office",
          "address": "123 Business Ave"
        },
        "startTime": "2024-01-20T08:00:00Z",
        "endTime": "2024-01-20T16:00:00Z",
        "duration": 8,
        "hourlyRate": 15.50,
        "totalPay": 124.00,
        "capacity": 2,
        "bookedCount": 1,
        "status": "available",
        "assignedTo": ["user_id"],
        "requirements": ["Customer Service", "Cash Handling"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalShifts": 45
    }
  }
}
```

#### POST /api/shifts
**Auth Required**: Admin only
```javascript
// Request Body
{
  "title": "Evening Shift",
  "description": "Security and maintenance duties",
  "locationId": "location_id",
  "startTime": "2024-01-20T18:00:00Z",
  "endTime": "2024-01-21T02:00:00Z",
  "hourlyRate": 18.00,
  "capacity": 1,
  "requirements": ["Security License", "Night Shift Experience"]
}

// Response (201 Created)
{
  "success": true,
  "message": "Shift created successfully",
  "data": {
    "shift": {
      "id": "new_shift_id",
      "title": "Evening Shift",
      "duration": 8,
      "totalPay": 144.00,
      "status": "available",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

#### POST /api/shifts/:id/book
**Auth Required**: Staff only
```javascript
// Request Body
{
  "notes": "Available for this shift" // Optional
}

// Response (200 OK)
{
  "success": true,
  "message": "Shift booked successfully",
  "data": {
    "shift": {
      "id": "shift_id",
      "title": "Morning Shift",
      "startTime": "2024-01-20T08:00:00Z",
      "endTime": "2024-01-20T16:00:00Z",
      "status": "booked",
      "bookedAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

### Time Tracking Endpoints

#### POST /api/time-entries/clock-in
**Auth Required**: Staff only
```javascript
// Request Body
{
  "shiftId": "shift_id",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5
  },
  "wifiNetwork": "Office_WiFi_5G",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "deviceType": "mobile"
  }
}

// Response (201 Created)
{
  "success": true,
  "message": "Clocked in successfully",
  "data": {
    "timeEntry": {
      "id": "entry_id",
      "userId": "user_id",
      "shiftId": "shift_id",
      "clockInTime": "2024-01-20T08:00:00Z",
      "status": "clocked_in",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "Downtown Office, 123 Business Ave"
      }
    }
  }
}
```

#### PUT /api/time-entries/clock-out
**Auth Required**: Staff only
```javascript
// Request Body
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5
  },
  "wifiNetwork": "Office_WiFi_5G",
  "notes": "Completed all assigned tasks"
}

// Response (200 OK)
{
  "success": true,
  "message": "Clocked out successfully",
  "data": {
    "timeEntry": {
      "id": "entry_id",
      "clockInTime": "2024-01-20T08:00:00Z",
      "clockOutTime": "2024-01-20T16:00:00Z",
      "hoursWorked": 8.0,
      "totalPay": 124.00,
      "status": "clocked_out"
    }
  }
}
```

### Location Management Endpoints

#### GET /api/locations
```javascript
// Response (200 OK)
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": "location_id",
        "name": "Downtown Office",
        "address": {
          "full": "123 Business Ave, New York, NY 10001",
          "city": "New York",
          "state": "NY"
        },
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "verificationRadius": 50,
        "wifiNetworks": ["Office_WiFi_5G", "Office_Guest"],
        "operatingHours": {
          "monday": { "open": "08:00", "close": "18:00", "isOpen": true }
        },
        "isActive": true
      }
    ]
  }
}
```

#### POST /api/locations
**Auth Required**: Admin only
```javascript
// Request Body
{
  "name": "Uptown Branch",
  "address": {
    "street": "456 North Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "US"
  },
  "coordinates": {
    "latitude": 40.7589,
    "longitude": -73.9851
  },
  "verificationRadius": 75,
  "wifiNetworks": ["Branch_WiFi", "Branch_Guest"],
  "contactInfo": {
    "phone": "+1-555-987-6543",
    "email": "uptown@suncoop.com",
    "manager": "Sarah Johnson"
  },
  "operatingHours": {
    "monday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "tuesday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "wednesday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "thursday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "friday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "saturday": { "open": "10:00", "close": "14:00", "isOpen": true },
    "sunday": { "isOpen": false }
  }
}

// Response (201 Created)
{
  "success": true,
  "message": "Location created successfully",
  "data": {
    "location": {
      "id": "new_location_id",
      "name": "Uptown Branch",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Reports & Analytics Endpoints

#### GET /api/reports/dashboard
**Auth Required**: Admin only
```javascript
// Query Parameters
{
  "period": "week", // week, month, quarter, year
  "locationId": "location_id" // Optional filter
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "summary": {
      "totalStaff": 48,
      "activeShifts": 12,
      "totalHours": 1247.5,
      "completionRate": 94.2
    },
    "staffUtilization": {
      "activeStaff": 35,
      "utilizationRate": 72.9
    },
    "topPerformers": [
      {
        "user": {
          "id": "user_id",
          "name": "John Doe",
          "employeeId": "EMP001"
        },
        "hoursWorked": 42.5,
        "shiftsCompleted": 6,
        "performance": 98.5
      }
    ],
    "locationStats": [
      {
        "location": {
          "id": "location_id",
          "name": "Downtown Office"
        },
        "totalHours": 320.5,
        "shiftsCount": 45,
        "avgShiftLength": 7.1
      }
    ]
  }
}
```

### Notification Endpoints

#### GET /api/notifications
**Auth Required**: Any authenticated user
```javascript
// Query Parameters
{
  "page": 1,
  "limit": 20,
  "unreadOnly": true,
  "type": "shift_reminder" // Optional filter
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "type": "shift_reminder",
        "title": "Upcoming Shift Reminder",
        "message": "You have a shift starting in 1 hour at Downtown Office",
        "isRead": false,
        "priority": "normal",
        "createdAt": "2024-01-20T07:00:00Z",
        "data": {
          "shiftId": "shift_id",
          "shiftTime": "2024-01-20T08:00:00Z"
        }
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalNotifications": 25
    }
  }
}
```

---

## Business Logic & Validation Rules

### User Validation
```javascript
const userValidationRules = {
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character"
  },
  firstName: {
    required: true,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  lastName: {
    required: true,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    maxLength: 20
  }
}
```

### Shift Validation
```javascript
const shiftValidationRules = {
  title: {
    required: true,
    maxLength: 100
  },
  startTime: {
    required: true,
    validate: (startTime, endTime) => {
      return new Date(startTime) > new Date() && 
             new Date(startTime) < new Date(endTime)
    }
  },
  endTime: {
    required: true,
    validate: (endTime, startTime) => {
      return new Date(endTime) > new Date(startTime)
    }
  },
  hourlyRate: {
    required: true,
    min: 0,
    max: 1000
  },
  capacity: {
    required: true,
    min: 1,
    max: 50
  }
}
```

### Business Rules
```javascript
const businessRules = {
  MAX_DAILY_HOURS: 8,
  MAX_MONTHLY_HOURS: 160,
  MAX_SHIFT_DURATION: 8,
  MIN_SHIFT_DURATION: 1,
  CANCELLATION_NOTICE_HOURS: 24,
  MAX_MONTHLY_CANCELLATIONS: 3,
  LOCATION_VERIFICATION_RADIUS: 50, // meters
  SESSION_TIMEOUT_HOURS: 8,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  
  // Penalty system
  PENALTY_HOURS_NO_SHOW: 2,
  PENALTY_HOURS_LATE_CANCELLATION: 1,
  
  // Working hours constraints
  WORK_START_HOUR: 6, // 6 AM
  WORK_END_HOUR: 23,  // 11 PM
  
  // Break rules
  REQUIRED_BREAK_AFTER_HOURS: 5,
  MIN_BREAK_DURATION_MINUTES: 15,
  MAX_BREAK_DURATION_MINUTES: 60
}
```

---

## Real-time Features (Socket.IO)

### WebSocket Events

#### Client to Server Events
```javascript
// Join user room for personal notifications
socket.emit('join_user_room', { userId: 'user_id' })

// Join admin room for system-wide events
socket.emit('join_admin_room', { userId: 'admin_id' })

// Update user location for real-time tracking
socket.emit('location_update', {
  userId: 'user_id',
  location: { latitude: 40.7128, longitude: -74.0060 },
  timestamp: Date.now()
})
```

#### Server to Client Events
```javascript
// Real-time shift updates
socket.emit('shift_updated', {
  shiftId: 'shift_id',
  status: 'booked',
  bookedBy: 'user_id',
  timestamp: Date.now()
})

// New notification
socket.emit('new_notification', {
  id: 'notification_id',
  type: 'shift_reminder',
  title: 'Shift Reminder',
  message: 'Your shift starts in 15 minutes'
})

// Time tracking updates
socket.emit('time_entry_updated', {
  entryId: 'entry_id',
  status: 'clocked_in',
  duration: 2.5,
  timestamp: Date.now()
})

// System announcements (admin only)
socket.emit('system_announcement', {
  message: 'System maintenance scheduled for tonight',
  priority: 'high',
  timestamp: Date.now()
})
```

---

## Setup Instructions

### 1. Environment Variables
Create a `.env` file with the following variables:
```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb://localhost:27017/suncoop_staff
MONGODB_TEST_URI=mongodb://localhost:27017/suncoop_staff_test

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@suncoop.com
FROM_NAME=SunCoop Staff Management

# SMS Configuration (Twilio) - Optional
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Redis (for session management) - Optional
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Geolocation API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── shiftController.js
│   │   ├── timeTrackingController.js
│   │   ├── locationController.js
│   │   ├── reportController.js
│   │   ├── notificationController.js
│   │   └── settingsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Shift.js
│   │   ├── TimeEntry.js
│   │   ├── Location.js
│   │   ├── Notification.js
│   │   ├── Settings.js
│   │   ├── AuditLog.js
│   │   └── File.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimit.js
│   │   ├── upload.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── shifts.js
│   │   ├── timeTracking.js
│   │   ├── locations.js
│   │   ├── reports.js
│   │   ├── notifications.js
│   │   └── settings.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── locationService.js
│   │   ├── notificationService.js
│   │   └── reportService.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── dateUtils.js
│   ├── config/
│   │   ├── database.js
│   │   ├── email.js
│   │   ├── upload.js
│   │   └── redis.js
│   ├── socket/
│   │   ├── index.js
│   │   ├── handlers/
│   │   │   ├── authHandler.js
│   │   │   ├── shiftHandler.js
│   │   │   └── notificationHandler.js
│   │   └── middleware/
│   │       └── socketAuth.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── logs/
├── uploads/
├── package.json
├── .env
├── .gitignore
├── README.md
└── server.js
```

### 3. Package Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.5",
    "nodemailer": "^6.9.7",
    "@sendgrid/mail": "^8.1.0",
    "twilio": "^4.20.0",
    "winston": "^3.11.0",
    "redis": "^4.6.10",
    "dotenv": "^16.3.1",
    "moment": "^2.29.4",
    "lodash": "^4.17.21",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^9.1.3"
  }
}
```

### 4. Database Initialization Script
```javascript
// scripts/initDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Location = require('../src/models/Location');
const Settings = require('../src/models/Settings');

async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create default admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@suncoop.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isSuperAdmin: true,
        isActive: true,
        isEmailVerified: true
      });
      console.log('Default admin user created');
    }
    
    // Create default settings
    const defaultSettings = [
      { category: 'business_rules', key: 'MAX_DAILY_HOURS', value: 8 },
      { category: 'business_rules', key: 'MAX_MONTHLY_HOURS', value: 160 },
      { category: 'business_rules', key: 'CANCELLATION_NOTICE_HOURS', value: 24 },
      { category: 'notifications', key: 'EMAIL_ENABLED', value: true },
      { category: 'security', key: 'SESSION_TIMEOUT_HOURS', value: 8 }
    ];
    
    for (const setting of defaultSettings) {
      await Settings.findOneAndUpdate(
        { category: setting.category, key: setting.key },
        setting,
        { upsert: true }
      );
    }
    
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
```

This comprehensive specification provides everything needed to implement a robust backend for your SunCoop Staff Management system. Each endpoint includes detailed request/response formats, validation rules, and business logic requirements. 