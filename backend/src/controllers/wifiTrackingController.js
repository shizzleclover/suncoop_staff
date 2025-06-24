/**
 * WiFi Tracking Controller
 * Handles WiFi-based time tracking API endpoints
 */

const WiFiTrackingService = require('../services/wifiTrackingService');
const AutoUnbookingService = require('../services/autoUnbookingService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class WiFiTrackingController {
  /**
   * Report WiFi connection status
   * POST /api/wifi-tracking/status
   */
  static async reportWiFiStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const userId = req.user.id;
      const { ssid, isConnected, locationId, shiftId, deviceInfo, location } = req.body;
      
      const result = await WiFiTrackingService.reportWiFiStatus(userId, {
        ssid,
        isConnected,
        locationId,
        shiftId,
        deviceInfo,
        location
      });
      
      if (result.success) {
        res.json({
          success: true,
          message: 'WiFi status reported successfully',
          data: result.wifiStatus
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Report WiFi status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report WiFi status'
      });
    }
  }
  
  /**
   * Get current WiFi status for user
   * GET /api/wifi-tracking/status
   */
  static async getWiFiStatus(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await WiFiTrackingService.getUserWiFiStatus(userId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.connections
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Get WiFi status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get WiFi status'
      });
    }
  }
  
  /**
   * Get WiFi connection history for user
   * GET /api/wifi-tracking/history
   */
  static async getConnectionHistory(req, res) {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;
      
      const result = await WiFiTrackingService.getConnectionHistory(userId, parseInt(days));
      
      if (result.success) {
        res.json({
          success: true,
          data: result.history
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Get connection history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get connection history'
      });
    }
  }
  
  /**
   * Get location's current WiFi connections (Admin only)
   * GET /api/wifi-tracking/location/:locationId/connections
   */
  static async getLocationConnections(req, res) {
    try {
      const { locationId } = req.params;
      
      const result = await WiFiTrackingService.getLocationConnections(locationId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.connections
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Get location connections error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get location connections'
      });
    }
  }
  
  /**
   * Force disconnect user (Admin only)
   * POST /api/wifi-tracking/force-disconnect
   */
  static async forceDisconnect(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { userId, locationId, reason } = req.body;
      
      const result = await WiFiTrackingService.forceDisconnect(userId, locationId, reason);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'User disconnected successfully',
          data: result.wifiStatus
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Force disconnect error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to force disconnect user'
      });
    }
  }
  
  /**
   * Submit explanation for missed shift
   * POST /api/wifi-tracking/missed-shift/explanation
   */
  static async submitMissedShiftExplanation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const userId = req.user.id;
      const { shiftId, explanation } = req.body;
      
      const result = await AutoUnbookingService.submitMissedShiftExplanation(userId, shiftId, explanation);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Submit missed shift explanation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit explanation'
      });
    }
  }
  
  /**
   * Get user's missed shifts requiring explanations
   * GET /api/wifi-tracking/missed-shifts
   */
  static async getUserMissedShifts(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await AutoUnbookingService.getUserMissedShifts(userId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.missedShifts
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Get user missed shifts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get missed shifts'
      });
    }
  }
  
  /**
   * Review missed shift explanation (Admin only)
   * POST /api/wifi-tracking/missed-shift/review
   */
  static async reviewMissedShiftExplanation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const adminUserId = req.user.id;
      const { shiftId, isApproved, adminNotes } = req.body;
      
      const result = await AutoUnbookingService.reviewMissedShiftExplanation(
        adminUserId, 
        shiftId, 
        isApproved, 
        adminNotes
      );
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            shiftId: result.shiftId,
            explanationUserId: result.explanationUserId,
            isApproved: result.isApproved
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Review missed shift explanation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review explanation'
      });
    }
  }
  
  /**
   * Get pending explanations for admin review (Admin only)
   * GET /api/wifi-tracking/pending-explanations
   */
  static async getPendingExplanations(req, res) {
    try {
      const result = await AutoUnbookingService.getPendingExplanations();
      
      if (result.success) {
        res.json({
          success: true,
          data: result.pendingExplanations
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Get pending explanations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending explanations'
      });
    }
  }
  
  /**
   * Check if user has pending explanations
   * GET /api/wifi-tracking/pending-explanations/check
   */
  static async checkPendingExplanations(req, res) {
    try {
      const userId = req.user.id;
      
      const hasPending = await AutoUnbookingService.hasPendingExplanations(userId);
      
      res.json({
        success: true,
        data: { hasPendingExplanations: hasPending }
      });
    } catch (error) {
      logger.error('Check pending explanations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check pending explanations'
      });
    }
  }
  
  /**
   * Get WiFi tracking statistics (Admin only)
   * GET /api/wifi-tracking/stats
   */
  static async getWiFiTrackingStats(req, res) {
    try {
      const { locationId, days = 7 } = req.query;
      const WiFiStatus = require('../models/WiFiStatus');
      const TimeEntry = require('../models/TimeEntry');
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(days));
      
      const query = {
        createdAt: { $gte: fromDate }
      };
      
      if (locationId) {
        query.locationId = locationId;
      }
      
      // Get WiFi connection statistics
      const totalConnections = await WiFiStatus.countDocuments(query);
      const activeConnections = await WiFiStatus.countDocuments({
        ...query,
        isConnected: true,
        isActive: true
      });
      
      // Get auto clock in/out statistics
      const autoClockIns = await TimeEntry.countDocuments({
        ...query,
        'wifiTracking.isWifiBasedEntry': true,
        status: { $in: ['clocked_in', 'completed'] }
      });
      
      const autoClockOuts = await TimeEntry.countDocuments({
        ...query,
        'wifiTracking.autoClockOutReasons.0': { $exists: true }
      });
      
      // Get auto-unbooking statistics
      const Shift = require('../models/Shift');
      const autoUnbookedShifts = await Shift.countDocuments({
        'autoUnbooking.autoUnbookedAt': { $gte: fromDate },
        status: 'AUTO_UNBOOKED'
      });
      
      res.json({
        success: true,
        data: {
          totalConnections,
          activeConnections,
          autoClockIns,
          autoClockOuts,
          autoUnbookedShifts,
          period: `${days} days`
        }
      });
    } catch (error) {
      logger.error('Get WiFi tracking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get WiFi tracking statistics'
      });
    }
  }
}

module.exports = WiFiTrackingController; 