/**
 * Socket.IO Configuration
 * Real-time communication setup
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('+isActive');

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userEmail = user.email;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userEmail} (${socket.id})`);

    // Join user to their own room for private messages
    socket.join(`user:${socket.userId}`);

    // Join admin room if user is admin
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    // Join staff room if user is staff
    if (socket.userRole === 'staff') {
      socket.join('staff');
    }

    // Handle shift updates
    socket.on('shift:subscribe', (data) => {
      if (data.shiftId) {
        socket.join(`shift:${data.shiftId}`);
        logger.info(`User ${socket.userEmail} subscribed to shift ${data.shiftId}`);
      }
    });

    socket.on('shift:unsubscribe', (data) => {
      if (data.shiftId) {
        socket.leave(`shift:${data.shiftId}`);
        logger.info(`User ${socket.userEmail} unsubscribed from shift ${data.shiftId}`);
      }
    });

    // Handle time tracking updates
    socket.on('timeTracking:subscribe', () => {
      socket.join(`timeTracking:${socket.userId}`);
      logger.info(`User ${socket.userEmail} subscribed to time tracking updates`);
    });

    // Handle notifications
    socket.on('notification:read', (data) => {
      // Emit to admins that notification was read
      socket.to('admins').emit('notification:read', {
        userId: socket.userId,
        notificationId: data.notificationId
      });
    });

    // Handle location updates (for time tracking)
    socket.on('location:update', (data) => {
      if (socket.userRole === 'staff') {
        // Broadcast location update to admins
        socket.to('admins').emit('location:update', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          location: data.location,
          timestamp: new Date()
        });
      }
    });

    // Handle WiFi tracking events
    socket.on('wifi:subscribe', (data) => {
      if (data.locationId) {
        socket.join(`wifi:location:${data.locationId}`);
        logger.info(`User ${socket.userEmail} subscribed to WiFi updates for location ${data.locationId}`);
      }
    });

    socket.on('wifi:unsubscribe', (data) => {
      if (data.locationId) {
        socket.leave(`wifi:location:${data.locationId}`);
        logger.info(`User ${socket.userEmail} unsubscribed from WiFi updates for location ${data.locationId}`);
      }
    });

    socket.on('wifi:status', async (data) => {
      try {
        // Handle real-time WiFi status updates
        const WiFiTrackingService = require('../services/wifiTrackingService');
        const result = await WiFiTrackingService.reportWiFiStatus(socket.userId, data);
        
        if (result.success) {
          // Emit confirmation back to the user
          socket.emit('wifi:status:confirmed', {
            success: true,
            wifiStatus: result.wifiStatus
          });
          
          // Emit to location room for real-time monitoring
          if (data.locationId) {
            socket.to(`wifi:location:${data.locationId}`).emit('wifi:status:update', {
              userId: socket.userId,
              userEmail: socket.userEmail,
              ...result.wifiStatus
            });
          }
          
          // Emit to admins for monitoring
          socket.to('admins').emit('wifi:status:update', {
            userId: socket.userId,
            userEmail: socket.userEmail,
            ...result.wifiStatus
          });
        } else {
          socket.emit('wifi:status:error', {
            success: false,
            message: result.message
          });
        }
      } catch (error) {
        logger.error('WiFi status socket error:', error);
        socket.emit('wifi:status:error', {
          success: false,
          message: 'Failed to process WiFi status'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userEmail} (${socket.id}) - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userEmail}:`, error);
    });
  });

  logger.info('Socket.IO initialized successfully');
  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit to specific user
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit to all admins
 */
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admins').emit(event, data);
  }
};

/**
 * Emit to all staff
 */
const emitToStaff = (event, data) => {
  if (io) {
    io.to('staff').emit(event, data);
  }
};

/**
 * Emit to all users
 */
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Emit shift update
 */
const emitShiftUpdate = (shiftId, event, data) => {
  if (io) {
    io.to(`shift:${shiftId}`).emit(event, data);
    // Also emit to admins
    io.to('admins').emit(event, data);
  }
};

/**
 * Emit notification to user
 */
const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
};

/**
 * Emit time tracking update
 */
const emitTimeTrackingUpdate = (userId, data) => {
  if (io) {
    // Emit to specific user
    io.to(`timeTracking:${userId}`).emit('timeTracking:update', data);
    // Also emit to admins
    io.to('admins').emit('timeTracking:update', {
      ...data,
      userId
    });
  }
};

/**
 * Emit WiFi status update
 */
const emitWiFiStatusUpdate = (userId, locationId, data) => {
  if (io) {
    // Emit to specific user
    io.to(`user:${userId}`).emit('wifi:status:update', data);
    // Emit to location room
    if (locationId) {
      io.to(`wifi:location:${locationId}`).emit('wifi:status:update', {
        ...data,
        userId
      });
    }
    // Emit to admins
    io.to('admins').emit('wifi:status:update', {
      ...data,
      userId
    });
  }
};

/**
 * Emit auto clock out notification
 */
const emitAutoClockOut = (userId, locationId, data) => {
  if (io) {
    // Emit to specific user
    io.to(`user:${userId}`).emit('timeTracking:auto_clock_out', data);
    // Emit to location room
    if (locationId) {
      io.to(`wifi:location:${locationId}`).emit('timeTracking:auto_clock_out', {
        ...data,
        userId
      });
    }
    // Emit to admins
    io.to('admins').emit('timeTracking:auto_clock_out', {
      ...data,
      userId
    });
  }
};

/**
 * Emit auto-unbooking notification
 */
const emitAutoUnbooking = (originalUserId, shiftId, data) => {
  if (io) {
    // Emit to specific user
    io.to(`user:${originalUserId}`).emit('shift:auto_unbooked', data);
    // Emit to shift room
    io.to(`shift:${shiftId}`).emit('shift:auto_unbooked', data);
    // Emit to admins
    io.to('admins').emit('shift:auto_unbooked', {
      ...data,
      originalUserId
    });
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToStaff,
  emitToAll,
  emitShiftUpdate,
  emitNotification,
  emitTimeTrackingUpdate,
  emitWiFiStatusUpdate,
  emitAutoClockOut,
  emitAutoUnbooking
}; 