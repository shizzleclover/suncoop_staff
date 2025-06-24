/**
 * Locations Controller
 * Handle location management operations
 */

const mongoose = require('mongoose');
const Location = require('../models/Location');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get all locations
 * GET /api/locations
 */
const getLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      isActive,
      managerId,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (managerId) filter.manager = managerId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get locations and total count
    const [locations, total] = await Promise.all([
      Location.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          { path: 'manager', select: 'firstName lastName email employeeId' },
          { path: 'createdBy', select: 'firstName lastName email' }
        ]),
      Location.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        locations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalLocations: total,
          hasNextPage: skip + locations.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve locations'
      }
    });
  }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await Location.findById(id).populate([
      { path: 'manager', select: 'firstName lastName email employeeId phone' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Get additional stats
    const [totalShifts, activeShifts] = await Promise.all([
      location.getTotalShifts(),
      location.getActiveShifts()
    ]);

    res.status(200).json({
      success: true,
      data: {
        location: {
          ...location.toObject(),
          stats: {
            totalShifts,
            activeShifts
          }
        }
      }
    });

  } catch (error) {
    logger.error('Get location by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve location'
      }
    });
  }
};

/**
 * Create new location (admin only)
 * POST /api/locations
 */
const createLocation = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country = 'US',
      type,
      capacity = 1,
      manager,
      contactPhone,
      contactEmail,
      description,
      operatingHours,
      coordinates,
      timezone = 'UTC',
      facilities = [],
      notes
    } = req.body;

    // Validate required fields
    if (!name || !address || !city || !type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name, address, city, and type are required'
        }
      });
    }

    // Check if location name already exists in the same city
    const existingLocation = await Location.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      city: { $regex: new RegExp(`^${city}$`, 'i') }
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Location with this name already exists in this city'
        }
      });
    }

    // Validate manager if provided
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser || !managerUser.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Manager not found or inactive'
          }
        });
      }
    }

    // Create location
    const location = await Location.create({
      name,
      address,
      city,
      state,
      zipCode,
      country,
      type,
      capacity,
      manager,
      contactPhone,
      contactEmail,
      description,
      operatingHours,
      coordinates,
      timezone,
      facilities,
      notes,
      createdBy: req.user.id
    });

    const populatedLocation = await Location.findById(location._id).populate([
      { path: 'manager', select: 'firstName lastName email employeeId' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    logger.info(`Location created: ${location._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: {
        location: populatedLocation
      }
    });

  } catch (error) {
    logger.error('Create location error:', error);
    logger.error('Request body:', req.body);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationErrors
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create location'
      }
    });
  }
};

/**
 * Update location (admin only)
 * PUT /api/locations/:id
 */
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Validate manager if being updated
    if (updates.manager) {
      const managerUser = await User.findById(updates.manager);
      if (!managerUser || !managerUser.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Manager not found or inactive'
          }
        });
      }
    }

    // Check name uniqueness if being updated
    if (updates.name && updates.name !== location.name) {
      const existingLocation = await Location.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        city: updates.city || location.city,
        _id: { $ne: id }
      });

      if (existingLocation) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Location with this name already exists in this city'
          }
        });
      }
    }

    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'manager', select: 'firstName lastName email employeeId' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    logger.info(`Location updated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: updatedLocation
      }
    });

  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update location'
      }
    });
  }
};

/**
 * Deactivate location (admin only)
 * DELETE /api/locations/:id
 */
const deactivateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Check for active shifts
    const activeShifts = await location.getActiveShifts();
    if (activeShifts > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot deactivate location with active shifts'
        }
      });
    }

    // Deactivate location
    location.isActive = false;
    await location.save();

    logger.info(`Location deactivated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Location deactivated successfully'
    });

  } catch (error) {
    logger.error('Deactivate location error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deactivate location'
      }
    });
  }
};

/**
 * Reactivate location (admin only)
 * POST /api/locations/:id/reactivate
 */
const reactivateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Reactivate location
    location.isActive = true;
    await location.save();

    const populatedLocation = await Location.findById(id).populate([
      { path: 'manager', select: 'firstName lastName email employeeId' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    logger.info(`Location reactivated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Location reactivated successfully',
      data: {
        location: populatedLocation
      }
    });

  } catch (error) {
    logger.error('Reactivate location error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reactivate location'
      }
    });
  }
};

/**
 * Get active locations
 * GET /api/locations/active
 */
const getActiveLocations = async (req, res) => {
  try {
    const { type } = req.query;

    let locations;
    if (type) {
      locations = await Location.findByType(type);
    } else {
      locations = await Location.findActive();
    }

    res.status(200).json({
      success: true,
      data: {
        locations
      }
    });

  } catch (error) {
    logger.error('Get active locations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve active locations'
      }
    });
  }
};

/**
 * Get locations by manager
 * GET /api/locations/by-manager/:managerId
 */
const getLocationsByManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    // Validate manager exists
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Manager not found'
        }
      });
    }

    const locations = await Location.findByManager(managerId);

    res.status(200).json({
      success: true,
      data: {
        locations,
        manager: {
          id: manager._id,
          name: manager.displayName,
          email: manager.email
        }
      }
    });

  } catch (error) {
    logger.error('Get locations by manager error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve locations by manager'
      }
    });
  }
};

/**
 * Find nearby locations
 * GET /api/locations/nearby
 */
const getNearbyLocations = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Latitude and longitude are required'
        }
      });
    }

    const locations = await Location.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(maxDistance)
    );

    res.status(200).json({
      success: true,
      data: {
        locations,
        searchParams: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          maxDistance: parseFloat(maxDistance)
        }
      }
    });

  } catch (error) {
    logger.error('Get nearby locations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to find nearby locations'
      }
    });
  }
};

/**
 * Get location shifts
 * GET /api/locations/:id/shifts
 */
const getLocationShifts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Build filter
    const filter = { locationId: id };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const Shift = require('../models/Shift');
    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'firstName lastName email employeeId'),
      Shift.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        shifts,
        location: {
          id: location._id,
          name: location.name,
          address: location.address
        },
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
    logger.error('Get location shifts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve location shifts'
      }
    });
  }
};

/**
 * Get location statistics
 * GET /api/locations/:id/stats
 */
const getLocationStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    const Shift = require('../models/Shift');
    const TimeEntry = require('../models/TimeEntry');

    // Get statistics
    const [
      totalShifts,
      activeShifts,
      completedShifts,
      totalTimeEntries,
      totalHoursWorked
    ] = await Promise.all([
      Shift.countDocuments({ locationId: id }),
      Shift.countDocuments({ locationId: id, status: { $in: ['AVAILABLE', 'BOOKED'] } }),
      Shift.countDocuments({ locationId: id, status: 'COMPLETED' }),
      TimeEntry.countDocuments({ locationId: id }),
      TimeEntry.aggregate([
        { $match: { locationId: new mongoose.Types.ObjectId(id), status: 'approved' } },
        { $group: { _id: null, totalHours: { $sum: '$hoursWorked' } } }
      ])
    ]);

    const stats = {
      totalShifts,
      activeShifts,
      completedShifts,
      totalTimeEntries,
      totalHoursWorked: totalHoursWorked[0]?.totalHours || 0
    };

    res.status(200).json({
      success: true,
      data: {
        location: {
          id: location._id,
          name: location.name,
          address: location.address
        },
        stats
      }
    });

  } catch (error) {
    logger.error('Get location stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve location statistics'
      }
    });
  }
};

/**
 * Activate location (admin only)
 * POST /api/locations/:id/activate
 */
const activateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Location not found'
        }
      });
    }

    // Activate location
    location.isActive = true;
    await location.save();

    const populatedLocation = await Location.findById(id).populate([
      { path: 'manager', select: 'firstName lastName email employeeId' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    logger.info(`Location activated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Location activated successfully',
      data: {
        location: populatedLocation
      }
    });

  } catch (error) {
    logger.error('Activate location error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to activate location'
      }
    });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deactivateLocation,
  reactivateLocation,
  activateLocation,
  getActiveLocations,
  getLocationsByManager,
  getNearbyLocations,
  getLocationShifts,
  getLocationStats
}; 