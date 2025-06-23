/**
 * Database Configuration
 * MongoDB connection setup with Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  writeConcern: {
    w: 'majority'
  }
};

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    logger.info('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, options);
    
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Clear database (for testing purposes)
 */
const clearDB = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDB can only be used in test environment');
  }
  
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    logger.info('Test database cleared');
  } catch (error) {
    logger.error('Error clearing test database:', error.message);
    throw error;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
  disconnectDB,
  clearDB
}; 