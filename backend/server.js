#!/usr/bin/env node

/**
 * SunCoop Staff Management - Backend Server
 * Main server entry point
 */

require('dotenv').config();
require('express-async-errors');

const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/config/database');
const { initializeSocket } = require('./src/socket');

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop cron jobs first
  try {
    const cronJobService = require('./src/services/cronJobService');
    cronJobService.stopAllJobs();
    logger.info('Cron jobs stopped');
  } catch (error) {
    logger.error('Error stopping cron jobs:', error);
  }
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    require('mongoose').connection.close(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
  
  // Force close if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');
    
    // Initialize cron jobs for auto-unbooking
    const cronJobService = require('./src/services/cronJobService');
    cronJobService.initializeJobs();
    logger.info('Auto-unbooking cron jobs initialized');
    
    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 SunCoop Staff Management Server started`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 Server running on port ${PORT}`);
      logger.info(`📡 API Base URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}`);
      
      if (NODE_ENV === 'development') {
        logger.info(`📋 API Documentation: http://localhost:${PORT}/api/docs`);
        logger.info(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
startServer(); 