/**
 * Users Controller
 * Handle user management operations
 */

const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

/**
 * Get all users (admin only)
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      department,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get users and total count
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'firstName lastName email'),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNextPage: skip + users.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve users'
      }
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('createdBy', 'firstName lastName email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve user'
      }
    });
  }
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve profile'
      }
    });
  }
};

/**
 * Create new user (admin only)
 * POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      phone,
      role = 'staff',
      department,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and password are required'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long'
        }
      });
    }

    // Validate phone number format if provided
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/[\s\-\(\)\+]/g, '');
      
      // More flexible phone validation
      // Supports: 090xxxxxxxx, +234xxxxxxxxx, 234xxxxxxxxx, international formats
      const isNigerianFormat = /^(0?[789]\d{9})$/.test(cleanPhone) || /^(234[789]\d{9})$/.test(cleanPhone);
      const isInternationalFormat = /^\d{7,15}$/.test(cleanPhone);
      
      if (!isNigerianFormat && !isInternationalFormat) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Please enter a valid phone number (e.g., 09012345678, +2349012345678)'
          }
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(username ? [{ username: username.toLowerCase() }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email or username already exists'
        }
      });
    }

    // Create user with admin-provided password
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : undefined,
      password, // Use the password provided by admin
      phone,
      role,
      department,
      isActive,
      createdBy: req.user.id
    });

    // Optional: Send welcome email without password (since admin sets it)
    try {
      const emailService = require('../services/emailService');
      await emailService.sendWelcomeEmail(user, null); // No password in email
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`User created: ${user.email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user
      }
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create user'
      }
    });
  }
};

/**
 * Update user (admin or self)
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own profile'
        }
      });
    }

    // Restrict fields for non-admin users
    if (!isAdmin) {
      const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
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

    // Validate email uniqueness if being updated
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: updates.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email already in use'
          }
        });
      }
    }

    // Validate username uniqueness if being updated
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ 
        username: updates.username.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Username already in use'
          }
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user'
      }
    });
  }
};

/**
 * Deactivate user (admin only)
 * DELETE /api/users/:id
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Prevent deactivating super admin
    if (user.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot deactivate super admin'
        }
      });
    }

    // Prevent self-deactivation
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You cannot deactivate your own account'
        }
      });
    }

    // Deactivate user
    user.isActive = false;
    await user.save();

    logger.info(`User deactivated: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deactivate user'
      }
    });
  }
};

/**
 * Reactivate user (admin only)
 * POST /api/users/:id/reactivate
 */
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Reactivate user
    user.isActive = true;
    await user.save();

    logger.info(`User reactivated: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    logger.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reactivate user'
      }
    });
  }
};

/**
 * Get user statistics (admin only)
 * GET /api/users/stats
 */
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      staffCount,
      adminCount,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'staff', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        staffCount,
        adminCount,
        newUsersThisMonth
      }
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve user statistics'
      }
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getProfile,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  getUserStats
}; 