/**
 * Time Tracking Controller
 * Handle time entry management operations
 */

const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const Location = require('../models/Location');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { emitTimeTrackingUpdate, emitNotification } = require('../socket');

/**
 * Get all time entries
 * GET /api/time-entries
 */
const getTimeEntries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      locationId,
      status,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (locationId) filter.locationId = locationId;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // For staff users, only show their own entries
    if (req.user.role === 'staff') {
      filter.userId = req.user.id;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get time entries and total count
    const [timeEntries, total] = await Promise.all([
      TimeEntry.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          { path: 'userId', select: 'firstName lastName email employeeId' },
          { path: 'locationId', select: 'name address city type' },
          { path: 'shiftId', select: 'startTime endTime description' },
          { path: 'approvedBy', select: 'firstName lastName email' }
        ]),
      TimeEntry.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeEntries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEntries: total,
          hasNextPage: skip + timeEntries.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get time entries error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve time entries'
      }
    });
  }
};

/**
 * Get time entry by ID
 * GET /api/time-entries/:id
 */
const getTimeEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timeEntry = await TimeEntry.findById(id).populate([
      { path: 'userId', select: 'firstName lastName email employeeId phone' },
      { path: 'locationId' },
      { path: 'shiftId' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Time entry not found'
        }
      });
    }

    // Check permissions for staff users
    if (req.user.role === 'staff' && timeEntry.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only view your own time entries'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        timeEntry
      }
    });

  } catch (error) {
    logger.error('Get time entry by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve time entry'
      }
    });
  }
};

/**
 * Create new time entry
 * POST /api/time-entries
 */
const createTimeEntry = async (req, res) => {
  try {
    const {
      locationId,
      shiftId,
      date,
      hoursWorked,
      breakTime = 0,
      notes,
      payRate
    } = req.body;

    // For staff users, they can only create entries for themselves
    const targetUserId = req.user.role === 'staff' ? req.user.id : req.body.userId || req.user.id;

    // Validate required fields
    if (!locationId || !date || !hoursWorked) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location, date, and hours worked are required'
        }
      });
    }

    // Validate location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Validate shift if provided
    if (shiftId) {
      const shift = await Shift.findById(shiftId);
      if (!shift) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Shift not found'
          }
        });
      }
    }

    // Check if entry already exists for this user/date/location
    const existingEntry = await TimeEntry.findOne({
      userId: targetUserId,
      date: new Date(date),
      locationId
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Time entry already exists for this date and location'
        }
      });
    }

    // Create time entry
    const timeEntry = await TimeEntry.create({
      userId: targetUserId,
      locationId,
      shiftId,
      date: new Date(date),
      hoursWorked: parseFloat(hoursWorked),
      breakTime: parseFloat(breakTime),
      notes,
      payRate: payRate ? parseFloat(payRate) : 0,
      status: 'pending'
    });

    const populatedTimeEntry = await TimeEntry.findById(timeEntry._id).populate([
      { path: 'userId', select: 'firstName lastName email employeeId' },
      { path: 'locationId', select: 'name address city type' },
      { path: 'shiftId', select: 'startTime endTime description' }
    ]);

    // Emit real-time update
    emitTimeTrackingUpdate(targetUserId, {
      type: 'entry:created',
      entry: populatedTimeEntry
    });

    logger.info(`Time entry created: ${timeEntry._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      data: {
        timeEntry: populatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Create time entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create time entry'
      }
    });
  }
};

/**
 * Clock in
 * POST /api/time-entries/clock-in
 */
const clockIn = async (req, res) => {
  try {
    const {
      locationId,
      shiftId,
      location // GPS coordinates
    } = req.body;

    // Validate required fields
    if (!locationId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location is required'
        }
      });
    }

    // Check if user is already clocked in
    const existingEntry = await TimeEntry.findOne({
      userId: req.user.id,
      status: 'clocked_in'
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You are already clocked in'
        }
      });
    }

    // Validate location exists
    const workLocation = await Location.findById(locationId);
    if (!workLocation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Check WiFi requirements for manual clock in (if enabled for location)
    if (workLocation.wifiSettings?.requireWifiForClockInOut && workLocation.wifiSettings?.ssid) {
      const WiFiStatus = require('../models/WiFiStatus');
      
      // Check if user has active WiFi connection to this location
      const activeWifiConnection = await WiFiStatus.findOne({
        userId: req.user.id,
        locationId: locationId,
        isConnected: true,
        isActive: true,
        ssid: workLocation.wifiSettings.ssid,
        // Connection must be recent (within last 5 minutes)
        createdAt: { 
          $gt: new Date(Date.now() - 5 * 60 * 1000) 
        }
      });

      if (!activeWifiConnection) {
        return res.status(400).json({
          success: false,
          error: {
            message: `You must be connected to the office WiFi network "${workLocation.wifiSettings.ssid}" to clock in at this location.`,
            code: 'WIFI_REQUIRED',
            details: {
              locationName: workLocation.name,
              requiredSSID: workLocation.wifiSettings.ssid,
              wifiRequired: true
            }
          }
        });
      }
    }

    // Create new time entry
    const timeEntry = await TimeEntry.create({
      userId: req.user.id,
      locationId,
      shiftId,
      date: new Date(),
      status: 'clocked_in'
    });

    // Clock in
    await timeEntry.clockIn(location);

    const populatedTimeEntry = await TimeEntry.findById(timeEntry._id).populate([
      { path: 'locationId', select: 'name address city type' },
      { path: 'shiftId', select: 'startTime endTime description' }
    ]);

    // Emit real-time update
    emitTimeTrackingUpdate(req.user.id, {
      type: 'clock:in',
      entry: populatedTimeEntry
    });

    logger.info(`User clocked in: ${req.user.email} at ${workLocation.name}`);

    res.status(200).json({
      success: true,
      message: 'Clocked in successfully',
      data: {
        timeEntry: populatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Clock in error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to clock in'
      }
    });
  }
};

/**
 * Clock out
 * POST /api/time-entries/clock-out
 */
const clockOut = async (req, res) => {
  try {
    const {
      timeEntryId,
      location, // GPS coordinates
      notes
    } = req.body;

    // Find active time entry
    let timeEntry;
    if (timeEntryId) {
      timeEntry = await TimeEntry.findById(timeEntryId);
    } else {
      timeEntry = await TimeEntry.findOne({
        userId: req.user.id,
        status: 'clocked_in'
      });
    }

    if (!timeEntry) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No active clock-in found'
        }
      });
    }

    // Check permissions for staff users
    if (req.user.role === 'staff' && timeEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only clock out from your own entries'
        }
      });
    }

    // Check WiFi requirements for manual clock out (if enabled for location)
    const workLocation = await Location.findById(timeEntry.locationId);
    if (workLocation?.wifiSettings?.requireWifiForClockInOut && workLocation.wifiSettings?.ssid) {
      const WiFiStatus = require('../models/WiFiStatus');
      
      // Check if user has active WiFi connection to this location
      const activeWifiConnection = await WiFiStatus.findOne({
        userId: req.user.id,
        locationId: timeEntry.locationId,
        isConnected: true,
        isActive: true,
        ssid: workLocation.wifiSettings.ssid,
        // Connection must be recent (within last 5 minutes)
        createdAt: { 
          $gt: new Date(Date.now() - 5 * 60 * 1000) 
        }
      });

      if (!activeWifiConnection) {
        return res.status(400).json({
          success: false,
          error: {
            message: `You must be connected to the office WiFi network "${workLocation.wifiSettings.ssid}" to clock out at this location.`,
            code: 'WIFI_REQUIRED',
            details: {
              locationName: workLocation.name,
              requiredSSID: workLocation.wifiSettings.ssid,
              wifiRequired: true
            }
          }
        });
      }
    }

    // Clock out
    await timeEntry.clockOut(location);

    if (notes) {
      timeEntry.notes = notes;
      await timeEntry.save();
    }

    const populatedTimeEntry = await TimeEntry.findById(timeEntry._id).populate([
      { path: 'locationId', select: 'name address city type' },
      { path: 'shiftId', select: 'startTime endTime description' }
    ]);

    // Emit real-time update
    emitTimeTrackingUpdate(req.user.id, {
      type: 'clock:out',
      entry: populatedTimeEntry
    });

    logger.info(`User clocked out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      data: {
        timeEntry: populatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Clock out error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to clock out'
      }
    });
  }
};

/**
 * Update time entry
 * PUT /api/time-entries/:id
 */
const updateTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if time entry exists
    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Time entry not found'
        }
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isOwner = timeEntry.userId.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own time entries'
        }
      });
    }

    // Restrict fields for non-admin users
    if (!isAdmin) {
      const allowedFields = ['notes'];
      const restrictedFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
      
      if (restrictedFields.length > 0) {
        return res.status(403).json({
          success: false,
          error: {
            message: `You cannot update these fields: ${restrictedFields.join(', ')}`
          }
        });
      }
    }

    // Update time entry
    const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'userId', select: 'firstName lastName email employeeId' },
      { path: 'locationId', select: 'name address city type' },
      { path: 'shiftId', select: 'startTime endTime description' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    // Emit real-time update
    emitTimeTrackingUpdate(timeEntry.userId, {
      type: 'entry:updated',
      entry: updatedTimeEntry
    });

    logger.info(`Time entry updated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Time entry updated successfully',
      data: {
        timeEntry: updatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Update time entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update time entry'
      }
    });
  }
};

/**
 * Approve time entry (admin only)
 * POST /api/time-entries/:id/approve
 */
const approveTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    // Check if time entry exists
    const timeEntry = await TimeEntry.findById(id).populate('userId');
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Time entry not found'
        }
      });
    }

    if (timeEntry.status === 'approved') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Time entry is already approved'
        }
      });
    }

    // Approve time entry
    await timeEntry.approve(req.user.id, adminNotes);

    const populatedTimeEntry = await TimeEntry.findById(id).populate([
      { path: 'userId', select: 'firstName lastName email employeeId' },
      { path: 'locationId', select: 'name address city type' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    // Create notification
    const notification = await Notification.createTimeEntryApproval(timeEntry.userId._id, {
      timeEntryId: id,
      hoursWorked: timeEntry.hoursWorked
    }, true);

    // Emit real-time updates
    emitTimeTrackingUpdate(timeEntry.userId._id, {
      type: 'entry:approved',
      entry: populatedTimeEntry
    });
    emitNotification(timeEntry.userId._id, notification);

    logger.info(`Time entry approved: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Time entry approved successfully',
      data: {
        timeEntry: populatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Approve time entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to approve time entry'
      }
    });
  }
};

/**
 * Reject time entry (admin only)
 * POST /api/time-entries/:id/reject
 */
const rejectTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Rejection reason is required'
        }
      });
    }

    // Check if time entry exists
    const timeEntry = await TimeEntry.findById(id).populate('userId');
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Time entry not found'
        }
      });
    }

    // Reject time entry
    await timeEntry.reject(req.user.id, reason);

    const populatedTimeEntry = await TimeEntry.findById(id).populate([
      { path: 'userId', select: 'firstName lastName email employeeId' },
      { path: 'locationId', select: 'name address city type' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    // Create notification
    const notification = await Notification.createTimeEntryApproval(timeEntry.userId._id, {
      timeEntryId: id,
      rejectedReason: reason
    }, false);

    // Emit real-time updates
    emitTimeTrackingUpdate(timeEntry.userId._id, {
      type: 'entry:rejected',
      entry: populatedTimeEntry
    });
    emitNotification(timeEntry.userId._id, notification);

    logger.info(`Time entry rejected: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Time entry rejected successfully',
      data: {
        timeEntry: populatedTimeEntry
      }
    });

  } catch (error) {
    logger.error('Reject time entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reject time entry'
      }
    });
  }
};

/**
 * Get pending approvals (admin only)
 * GET /api/time-entries/pending
 */
const getPendingApprovals = async (req, res) => {
  try {
    const timeEntries = await TimeEntry.findPendingApproval();

    res.status(200).json({
      success: true,
      data: {
        timeEntries
      }
    });

  } catch (error) {
    logger.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve pending approvals'
      }
    });
  }
};

/**
 * Get currently working users (admin only)
 * GET /api/time-entries/currently-working
 */
const getCurrentlyWorking = async (req, res) => {
  try {
    const timeEntries = await TimeEntry.findCurrentlyWorking();

    res.status(200).json({
      success: true,
      data: {
        timeEntries
      }
    });

  } catch (error) {
    logger.error('Get currently working error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve currently working users'
      }
    });
  }
};

/**
 * Get user's time summary
 * GET /api/time-entries/summary
 */
const getTimeSummary = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    // For staff users, they can only view their own summary
    const targetUserId = req.user.role === 'staff' ? req.user.id : (userId || req.user.id);
    
    const fromDate = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = endDate ? new Date(endDate) : new Date();

    const [summaryData] = await TimeEntry.getUserTotalHours(targetUserId, fromDate, toDate);

    const summary = summaryData || {
      totalHours: 0,
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      totalPay: 0
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        period: {
          startDate: fromDate,
          endDate: toDate
        }
      }
    });

  } catch (error) {
    logger.error('Get time summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve time summary'
      }
    });
  }
};

/**
 * Check WiFi requirements for clock in/out
 * GET /api/time-entries/wifi-check/:locationId
 */
const checkWiFiRequirements = async (req, res) => {
  try {
    const { locationId } = req.params;

    // Validate location exists
    const workLocation = await Location.findById(locationId);
    if (!workLocation) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    const wifiRequired = workLocation.wifiSettings?.requireWifiForClockInOut && workLocation.wifiSettings?.ssid;
    
    let wifiConnected = false;
    let connectionDetails = null;

    if (wifiRequired) {
      const WiFiStatus = require('../models/WiFiStatus');
      
      // Check if user has active WiFi connection to this location
      const activeWifiConnection = await WiFiStatus.findOne({
        userId: req.user.id,
        locationId: locationId,
        isConnected: true,
        isActive: true,
        ssid: workLocation.wifiSettings.ssid,
        // Connection must be recent (within last 5 minutes)
        createdAt: { 
          $gt: new Date(Date.now() - 5 * 60 * 1000) 
        }
      });

      if (activeWifiConnection) {
        wifiConnected = true;
        connectionDetails = {
          ssid: activeWifiConnection.ssid,
          connectedAt: activeWifiConnection.createdAt,
          locationName: workLocation.name
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        locationId,
        locationName: workLocation.name,
        wifiRequired,
        wifiConnected,
        connectionDetails,
        requiredSSID: workLocation.wifiSettings?.ssid || null,
        canClockIn: !wifiRequired || wifiConnected,
        canClockOut: !wifiRequired || wifiConnected
      }
    });

  } catch (error) {
    logger.error('WiFi check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check WiFi requirements'
      }
    });
  }
};

module.exports = {
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  clockIn,
  clockOut,
  updateTimeEntry,
  approveTimeEntry,
  rejectTimeEntry,
  getPendingApprovals,
  getCurrentlyWorking,
  getTimeSummary,
  checkWiFiRequirements
}; 