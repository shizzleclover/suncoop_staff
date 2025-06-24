/**
 * Authentication Controller
 * Handles user authentication, registration, and password management
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register initial admin user (system setup)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const {
      organizationName,
      organizationType,
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      phone
    } = req.body;

    // Basic validation - just check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and password are required'
        }
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Passwords do not match'
        }
      });
    }

    // Check if any admin already exists (this should be first admin)
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'System already has an administrator. Please use the login page.'
        }
      });
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

    // Create admin user
    const adminUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : undefined,
      password,
      phone,
      role: 'admin',
      isSuperAdmin: true,
      organizationName,
      organizationType,
      isActive: true,
      isEmailVerified: true // Auto-verify initial admin
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(adminUser._id);

    // Update login info
    await adminUser.updateLastLogin(req.ip, req.get('User-Agent'));

    logger.info(`Initial admin user created: ${adminUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        user: {
          id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          displayName: adminUser.displayName,
          role: adminUser.role,
          isSuperAdmin: adminUser.isSuperAdmin
        },
        token: accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed. Please try again.'
      }
    });
  }
};

/**
 * Staff self-registration
 * POST /api/auth/staff-register
 */
const staffRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      phone,
      department
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and password are required'
        }
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Passwords do not match'
        }
      });
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

    // Create staff user (will be pending approval by default)
    const staffUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : undefined,
      password,
      phone,
      department,
      role: 'staff',
      isActive: true,
      // Default approval settings for staff (set by schema defaults)
      approvalStatus: 'pending',
      isApproved: false
    });

    // Send notification to admins about new staff registration
    try {
      const admins = await User.findAdmins();
      if (admins.length > 0) {
        const Notification = require('../models/Notification');
        
        const notifications = admins.map(admin => ({
          userId: admin._id,
          type: 'staff_registration',
          title: 'New Staff Registration',
          message: `${staffUser.firstName} ${staffUser.lastName} has requested to join as a staff member.`,
          priority: 'normal',
          category: 'info',
          data: {
            staffId: staffUser._id,
            staffName: `${staffUser.firstName} ${staffUser.lastName}`,
            staffEmail: staffUser.email
          }
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      logger.error('Failed to send admin notifications:', notificationError);
      // Don't fail the registration if notification fails
    }

    logger.info(`Staff registration request: ${staffUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending approval by an administrator.',
      data: {
        user: {
          id: staffUser._id,
          email: staffUser.email,
          firstName: staffUser.firstName,
          lastName: staffUser.lastName,
          displayName: staffUser.displayName,
          role: staffUser.role,
          approvalStatus: staffUser.approvalStatus
        }
      }
    });

  } catch (error) {
    logger.error('Staff registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed. Please try again.'
      }
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email/username and password are required'
        }
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    }).select('+password +isActive');

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated. Please contact support.'
        }
      });
    }

    // Check if user can login (approval status for staff)
    if (!user.canLogin()) {
      if (user.approvalStatus === 'pending') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Your account is pending approval by an administrator.'
          }
        });
      } else if (user.approvalStatus === 'rejected') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Your account has been rejected. Please contact support.'
          }
        });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update login info
    await user.updateLastLogin(req.ip, req.get('User-Agent'));

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          role: user.role,
          employeeId: user.employeeId,
          lastLogin: user.lastLogin
        },
        token: accessToken,
        refreshToken,
        expiresIn: 86400 // 24 hours in seconds
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed. Please try again.'
      }
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token'
        }
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token'
      }
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is required'
        }
      });
    }

    const user = await User.findByEmail(email);

    // Always return success for security (don't reveal if email exists)
    const successMessage = 'If the email exists, a password reset link has been sent.';

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Password reset requested for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: successMessage,
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Could not send password reset email. Please try again.'
      }
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Token, password, and password confirmation are required'
        }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Passwords do not match'
        }
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset completed for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Password reset failed. Please try again.'
      }
    });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Could not retrieve user information'
      }
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password, new password, and confirmation are required'
        }
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'New passwords do not match'
        }
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.checkPassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Password change failed. Please try again.'
      }
    });
  }
};

/**
 * Logout user (for logging purposes)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed'
      }
    });
  }
};

/**
 * Check system setup status
 * GET /api/auth/system-status
 */
const getSystemStatus = async (req, res) => {
  try {
    // Check if any admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    res.status(200).json({
      success: true,
      data: {
        needsInitialSetup: !adminExists,
        hasAdmin: !!adminExists,
        isInitialized: !!adminExists
      }
    });

  } catch (error) {
    logger.error('System status check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check system status'
      }
    });
  }
};

module.exports = {
  register,
  staffRegister,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  logout,
  getSystemStatus
}; 