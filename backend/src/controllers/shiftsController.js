/**
 * Shifts Controller
 * Handle shift management operations
 */

const Shift = require('../models/Shift');
const User = require('../models/User');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { getIO } = require('../socket');

/**
 * Get all shifts with pagination and filters
 * GET /api/shifts
 */
const getShifts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      locationId,
      assignedTo,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (locationId) filter.locationId = locationId;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get shifts and total count
    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('locationId', 'name address city type')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email'),
      Shift.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        shifts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalShifts: total,
          hasNextPage: skip + shifts.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve shifts'
      }
    });
  }
};

/**
 * Get available shifts
 * GET /api/shifts/available
 */
const getAvailableShifts = async (req, res) => {
  try {
    const { 
      locationId,
      startDate,
      endDate,
      limit = 20
    } = req.query;

    let query = Shift.findAvailable();
    
    if (locationId) {
      query = query.where('locationId').equals(locationId);
    }
    
    if (startDate) {
      query = query.where('startTime').gte(new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('startTime').lte(new Date(endDate));
    }

    const shifts = await query
      .populate('locationId', 'name address city type')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        shifts
      }
    });

  } catch (error) {
    logger.error('Get available shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve available shifts'
      }
    });
  }
};

/**
 * Get user's shifts
 * GET /api/shifts/my-shifts
 */
const getUserShifts = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    let query = Shift.findByUser(userId);
    
    if (status) {
      query = query.where('status').equals(status);
    }
    
    if (startDate) {
      query = query.where('startTime').gte(new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('startTime').lte(new Date(endDate));
    }

    const shifts = await query
      .populate('locationId', 'name address city type')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        shifts
      }
    });

  } catch (error) {
    logger.error('Get user shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve user shifts'
      }
    });
  }
};

/**
 * Get shift by ID
 * GET /api/shifts/:id
 */
const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shift = await Shift.findById(id)
      .populate('locationId', 'name address city type coordinates operatingHours')
      .populate('assignedTo', 'firstName lastName email employeeId phone')
      .populate('createdBy', 'firstName lastName email');
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Shift not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shift
      }
    });

  } catch (error) {
    logger.error('Get shift by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve shift'
      }
    });
  }
};

/**
 * Create new shift
 * POST /api/shifts
 */
const createShift = async (req, res) => {
  try {
    const {
      locationId,
      startTime,
      endTime,
      description,
      requirements = [],
      maxCapacity = 1,
      isRecurring = false,
      recurringPattern,
      notes
    } = req.body;

    // Validate required fields
    if (!locationId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location, start time, and end time are required'
        }
      });
    }

    // Validate location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid location'
        }
      });
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'End time must be after start time'
        }
      });
    }

    // Create shift
    const shift = await Shift.create({
      locationId,
      startTime: start,
      endTime: end,
      description,
      requirements,
      maxCapacity,
      isRecurring,
      recurringPattern,
      notes,
      createdBy: req.user.id
    });

    // Populate the response
    const populatedShift = await Shift.findById(shift._id)
      .populate('locationId', 'name address city type')
      .populate('createdBy', 'firstName lastName email');

    logger.info(`Shift created: ${shift._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: {
        shift: populatedShift
      }
    });

  } catch (error) {
    logger.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create shift'
      }
    });
  }
};

/**
 * Update shift
 * PUT /api/shifts/:id
 */
const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      locationId,
      startTime,
      endTime,
      description,
      requirements,
      maxCapacity,
      notes,
      status
    } = req.body;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Shift not found'
        }
      });
    }

    // Check if shift is in the past and completed
    if (shift.isInPast() && shift.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot update completed shift'
        }
      });
    }

    // Update shift
    const updateData = {};
    if (locationId) updateData.locationId = locationId;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (description) updateData.description = description;
    if (requirements) updateData.requirements = requirements;
    if (maxCapacity) updateData.maxCapacity = maxCapacity;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('locationId', 'name address city type')
     .populate('assignedTo', 'firstName lastName email employeeId')
     .populate('createdBy', 'firstName lastName email');

    logger.info(`Shift updated: ${id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Shift updated successfully',
      data: {
        shift: updatedShift
      }
    });

  } catch (error) {
    logger.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update shift'
      }
    });
  }
};

/**
 * Assign user to shift
 * POST /api/shifts/:id/assign
 */
const assignShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // If no userId provided, assign to current user
    const targetUserId = userId || req.user.id;

    // Validate user exists and is staff
    const user = await User.findById(targetUserId).select('+isActive');
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or inactive user'
        }
      });
    }

    // Get shift
    const shift = await Shift.findById(id).populate('locationId');
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Shift not found'
        }
      });
    }

    // Check if shift is available
    if (!shift.isAvailable()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Shift is not available for assignment'
        }
      });
    }

    // Assign user to shift
    await shift.assignUser(targetUserId);

    // Reload with populated data
    const assignedShift = await Shift.findById(id)
      .populate('locationId', 'name address city type')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('createdBy', 'firstName lastName email');

    logger.info(`Shift assigned: ${id} to user ${targetUserId} by ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Shift assigned successfully',
      data: {
        shift: assignedShift
      }
    });

  } catch (error) {
    logger.error('Assign shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to assign shift'
      }
    });
  }
};

/**
 * Unassign user from shift
 * POST /api/shifts/:id/unassign
 */
const unassignShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findById(id).populate('locationId assignedTo');
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Shift not found'
        }
      });
    }

    if (!shift.assignedTo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Shift is not assigned to anyone'
        }
      });
    }

    // Check permissions - only admin or assigned user can unassign
    if (req.user.role !== 'admin' && shift.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to unassign this shift'
        }
      });
    }

    const assignedUserId = shift.assignedTo._id;
    
    // Unassign the shift
    await shift.unassignUser();

    // Reload with populated data
    const unassignedShift = await Shift.findById(id)
      .populate('locationId', 'name address city type')
      .populate('createdBy', 'firstName lastName email');

    logger.info(`Shift unassigned: ${id} from user ${assignedUserId} by ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Shift unassigned successfully',
      data: {
        shift: unassignedShift
      }
    });

  } catch (error) {
    logger.error('Unassign shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to unassign shift'
      }
    });
  }
};

/**
 * Delete shift
 * DELETE /api/shifts/:id
 */
const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findById(id).populate('assignedTo locationId');
    if (!shift) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Shift not found'
        }
      });
    }

    // Check if shift has started
    if (shift.startTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete shift that has already started'
        }
      });
    }

    await Shift.findByIdAndDelete(id);

    logger.info(`Shift deleted: ${id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully'
    });

  } catch (error) {
    logger.error('Delete shift error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete shift'
      }
    });
  }
};

/**
 * Clear all shifts (admin only)
 * DELETE /api/shifts/clear-all
 */
const clearAllShifts = async (req, res) => {
  try {
    const { confirmText } = req.body;

    // Require confirmation text for safety
    if (confirmText !== 'DELETE ALL SHIFTS') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please confirm by typing "DELETE ALL SHIFTS" exactly'
        }
      });
    }

    // Get total count before deletion
    const totalShifts = await Shift.countDocuments();
    
    // Get count of shifts with assignments for notification purposes
    const bookedShifts = await Shift.countDocuments({ assignedTo: { $ne: null } });

    // Delete all shifts regardless of status
    const result = await Shift.deleteMany({});

    logger.warn(`All shifts cleared: ${result.deletedCount} shifts deleted by admin ${req.user.email}`);

    // Create notifications for users who had booked shifts
    if (bookedShifts > 0) {
      const User = require('../models/User');
      const staffUsers = await User.find({ role: 'staff', isActive: true }).select('_id');
      
      const notifications = staffUsers.map(user => ({
        userId: user._id,
        type: 'shift_cancelled',
        title: 'All Shifts Cleared',
        message: 'All shifts have been cleared by an administrator. Please check for new shifts.',
        priority: 'high',
        category: 'warning'
      }));

      if (notifications.length > 0) {
        const Notification = require('../models/Notification');
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      success: true,
      message: `All shifts cleared successfully. ${result.deletedCount} shifts deleted.`,
      data: {
        deletedCount: result.deletedCount,
        totalShifts,
        bookedShifts
      }
    });

  } catch (error) {
    logger.error('Clear all shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to clear all shifts'
      }
    });
  }
};

module.exports = {
  getShifts,
  getAvailableShifts,
  getUserShifts,
  getShiftById,
  createShift,
  updateShift,
  assignShift,
  unassignShift,
  deleteShift,
  clearAllShifts
}; 