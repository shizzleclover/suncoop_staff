/**
 * SunCoop Staff Management - Express App Configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shiftRoutes = require('./routes/shifts');
const timeTrackingRoutes = require('./routes/timeTracking');
const locationRoutes = require('./routes/locations');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');


const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow all origins for deployment
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 100), // Higher limit for development
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//     retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   // Skip rate limiting for health checks and system status in development
//   skip: (req, res) => {
//     if (process.env.NODE_ENV === 'development') {
//       return req.path === '/api/health' || req.path === '/api/auth/system-status';
//     }
//     return false;
//   }
// });

// More lenient rate limiter for auth endpoints - DISABLED FOR DEVELOPMENT
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.NODE_ENV === 'development' ? 200 : 50, // 200 requests per 15 minutes in development
//   message: {
//     error: 'Too many authentication requests from this IP, please try again later.',
//     retryAfter: 900
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// RATE LIMITING DISABLED FOR DEVELOPMENT
// app.use('/api/', limiter);
// app.use('/api/auth', authLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) },
    skip: (req, res) => res.statusCode < 400
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SunCoop Staff Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version
  });
});

// Root route for Render health checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SunCoop Staff Management API',
    version: require('../package.json').version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      docs: process.env.NODE_ENV === 'development' ? '/api/docs' : undefined
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/time-entries', timeTrackingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);


// API documentation endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/docs', (req, res) => {
    res.status(200).json({
      message: 'SunCoop Staff Management API Documentation',
      version: require('../package.json').version,
      baseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        shifts: '/api/shifts',
        timeEntries: '/api/time-entries',
        locations: '/api/locations',
        reports: '/api/reports',
        notifications: '/api/notifications',
        settings: '/api/settings'
      },
      healthCheck: '/api/health',
      documentation: 'See BACKEND_API_SPECIFICATION.md for detailed documentation'
    });
  });
}

// Catch 404 and forward to error handler
app.all('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app; 