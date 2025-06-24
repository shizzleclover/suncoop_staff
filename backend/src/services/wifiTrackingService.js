/**
 * WiFi Tracking Service
 * Handles WiFi-based automatic clock in/out functionality
 */

const WiFiStatus = require('../models/WiFiStatus');
const TimeEntry = require('../models/TimeEntry');
const Shift = require('../models/Shift');
const Location = require('../models/Location');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { emitTimeTrackingUpdate, emitNotification } = require('../socket');

class WiFiTrackingService {
  /**
   * Report WiFi connection status from client
   */
  static async reportWiFiStatus(userId, data) {
    try {
      const { ssid, isConnected, locationId, shiftId, deviceInfo, location } = data;
      
      // Validate location exists and has WiFi tracking enabled
      const workLocation = await Location.findById(locationId);
      if (!workLocation || !workLocation.wifiSettings?.isWifiTrackingEnabled) {
        return { success: false, message: 'WiFi tracking not enabled for this location' };
      }
      
      // Check if SSID matches location's configured SSID
      if (workLocation.wifiSettings.ssid !== ssid) {
        return { success: false, message: 'SSID does not match location configuration' };
      }
      
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return { success: false, message: 'User not found or inactive' };
      }
      
      // Find existing connection status
      let wifiStatus = await WiFiStatus.findOne({
        userId,
        locationId,
        isConnected: true,
        isActive: true
      });
      
      if (isConnected) {
        // User connected to WiFi
        if (!wifiStatus) {
          // Create new connection record
          wifiStatus = await WiFiStatus.createConnection({
            userId,
            locationId,
            shiftId,
            ssid,
            deviceInfo,
            location
          });
          
          logger.info(`WiFi connection established: User ${userId} at ${ssid}`);
          
          // Check if user should be auto-clocked in
          const autoClockInResult = await this.handleAutoClockIn(userId, locationId, shiftId, wifiStatus._id);
          if (autoClockInResult.success) {
            await wifiStatus.addAutoAction('auto_clock_in', 'success', 
              `Auto clocked in at ${workLocation.name}`, autoClockInResult.timeEntryId);
          }
        }
      } else {
        // User disconnected from WiFi
        if (wifiStatus) {
          await wifiStatus.disconnect();
          
          logger.info(`WiFi disconnection detected: User ${userId} from ${ssid}`);
          
          // Check if user should be auto-clocked out
          const autoClockOutResult = await this.handleAutoClockOut(userId, locationId, wifiStatus._id);
          if (autoClockOutResult.success) {
            await wifiStatus.addAutoAction('auto_clock_out', 'success', 
              'Auto clocked out due to WiFi disconnection', autoClockOutResult.timeEntryId);
          }
        }
      }
      
      return { success: true, wifiStatus };
      
    } catch (error) {
      logger.error('WiFi status report error:', error);
      return { success: false, message: 'Failed to process WiFi status' };
    }
  }
  
  /**
   * Handle automatic clock in when user connects to WiFi
   */
  static async handleAutoClockIn(userId, locationId, shiftId, wifiStatusId) {
    try {
      // Check if user is already clocked in
      const existingEntry = await TimeEntry.findOne({
        userId,
        status: 'clocked_in'
      });
      
      if (existingEntry) {
        return { success: false, message: 'User already clocked in' };
      }
      
      // Check if user has a valid shift
      let shift = null;
      if (shiftId) {
        shift = await Shift.findById(shiftId);
        if (!shift || shift.assignedTo?.toString() !== userId) {
          return { success: false, message: 'Invalid shift assignment' };
        }
      }
      
      // Create time entry
      const timeEntry = await TimeEntry.create({
        userId,
        locationId,
        shiftId,
        date: new Date(),
        status: 'clocked_in',
        'wifiTracking.isWifiBasedEntry': true,
        'wifiTracking.clockInWifiSSID': await this.getLocationSSID(locationId)
      });
      
      await timeEntry.clockIn();
      
      // Add WiFi connection log
      timeEntry.wifiTracking.wifiConnectionLogs.push({
        action: 'clock_in',
        ssid: await this.getLocationSSID(locationId),
        timestamp: new Date()
      });
      await timeEntry.save();
      
      // Send notification
      const location = await Location.findById(locationId);
      const notification = await Notification.create({
        userId,
        type: 'time_tracking',
        title: 'Auto Clock In',
        message: `You have been automatically clocked in at ${location.name} via WiFi connection.`,
        priority: 'normal',
        category: 'info'
      });
      
      // Emit real-time updates
      emitTimeTrackingUpdate(userId, {
        type: 'auto_clock_in',
        entry: timeEntry,
        wifiStatusId
      });
      emitNotification(userId, notification);
      
      logger.info(`Auto clock in successful: User ${userId} at location ${locationId}`);
      
      return { success: true, timeEntryId: timeEntry._id };
      
    } catch (error) {
      logger.error('Auto clock in error:', error);
      return { success: false, message: 'Auto clock in failed' };
    }
  }
  
  /**
   * Handle automatic clock out when user disconnects from WiFi
   */
  static async handleAutoClockOut(userId, locationId, wifiStatusId) {
    try {
      // Find active time entry
      const timeEntry = await TimeEntry.findOne({
        userId,
        status: 'clocked_in',
        locationId
      });
      
      if (!timeEntry) {
        return { success: false, message: 'No active time entry found' };
      }
      
      // Get location settings for delay
      const location = await Location.findById(locationId);
      const delaySeconds = location.wifiSettings?.autoClockOutDelay || 60;
      
      // Schedule delayed clock out
      setTimeout(async () => {
        try {
          // Check if user reconnected during delay period
          const reconnected = await WiFiStatus.findOne({
            userId,
            locationId,
            isConnected: true,
            isActive: true,
            createdAt: { $gt: new Date(Date.now() - (delaySeconds * 1000)) }
          });
          
          if (reconnected) {
            logger.info(`Auto clock out cancelled: User ${userId} reconnected within grace period`);
            return;
          }
          
          // Proceed with auto clock out
          await timeEntry.clockOut();
          
          // Add WiFi tracking info
          timeEntry.wifiTracking.clockOutWifiSSID = location.wifiSettings.ssid;
          timeEntry.wifiTracking.autoClockOutReasons.push({
            reason: 'wifi_disconnected',
            timestamp: new Date(),
            details: `Auto clocked out after ${delaySeconds} seconds of WiFi disconnection`
          });
          
          timeEntry.wifiTracking.wifiConnectionLogs.push({
            action: 'clock_out',
            ssid: location.wifiSettings.ssid,
            timestamp: new Date()
          });
          
          await timeEntry.save();
          
          // Send notification
          const notification = await Notification.create({
            userId,
            type: 'time_tracking',
            title: 'Auto Clock Out',
            message: `You have been automatically clocked out from ${location.name} due to WiFi disconnection.`,
            priority: 'normal',
            category: 'warning'
          });
          
          // Emit real-time updates
          emitTimeTrackingUpdate(userId, {
            type: 'auto_clock_out',
            entry: timeEntry,
            wifiStatusId,
            reason: 'wifi_disconnected'
          });
          emitNotification(userId, notification);
          
          logger.info(`Auto clock out successful: User ${userId} from location ${locationId}`);
          
        } catch (delayedError) {
          logger.error('Delayed auto clock out error:', delayedError);
        }
      }, delaySeconds * 1000);
      
      return { success: true, timeEntryId: timeEntry._id, delaySeconds };
      
    } catch (error) {
      logger.error('Auto clock out error:', error);
      return { success: false, message: 'Auto clock out failed' };
    }
  }
  
  /**
   * Get current WiFi status for user
   */
  static async getUserWiFiStatus(userId) {
    try {
      const connections = await WiFiStatus.findCurrentConnections(userId);
      return { success: true, connections };
    } catch (error) {
      logger.error('Get WiFi status error:', error);
      return { success: false, message: 'Failed to get WiFi status' };
    }
  }
  
  /**
   * Get WiFi connection history for user
   */
  static async getConnectionHistory(userId, days = 7) {
    try {
      const history = await WiFiStatus.getUserConnectionHistory(userId, days);
      return { success: true, history };
    } catch (error) {
      logger.error('Get connection history error:', error);
      return { success: false, message: 'Failed to get connection history' };
    }
  }
  
  /**
   * Get location's current WiFi connections
   */
  static async getLocationConnections(locationId) {
    try {
      const connections = await WiFiStatus.getLocationConnections(locationId, true);
      return { success: true, connections };
    } catch (error) {
      logger.error('Get location connections error:', error);
      return { success: false, message: 'Failed to get location connections' };
    }
  }
  
  /**
   * Helper method to get location SSID
   */
  static async getLocationSSID(locationId) {
    try {
      const location = await Location.findById(locationId);
      return location?.wifiSettings?.ssid || '';
    } catch (error) {
      logger.error('Get location SSID error:', error);
      return '';
    }
  }
  
  /**
   * Clean up old WiFi status records
   */
  static async cleanupOldRecords(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await WiFiStatus.deleteMany({
        createdAt: { $lt: cutoffDate },
        isConnected: false
      });
      
      logger.info(`Cleaned up ${result.deletedCount} old WiFi status records`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      logger.error('WiFi cleanup error:', error);
      return { success: false, message: 'Cleanup failed' };
    }
  }
  
  /**
   * Force disconnect user (admin action)
   */
  static async forceDisconnect(userId, locationId, reason = 'admin_action') {
    try {
      const wifiStatus = await WiFiStatus.findOne({
        userId,
        locationId,
        isConnected: true,
        isActive: true
      });
      
      if (!wifiStatus) {
        return { success: false, message: 'No active connection found' };
      }
      
      await wifiStatus.disconnect();
      
      // Handle auto clock out
      const autoClockOutResult = await this.handleAutoClockOut(userId, locationId, wifiStatus._id);
      
      if (autoClockOutResult.success) {
        await wifiStatus.addAutoAction('auto_clock_out', 'success', 
          `Force disconnected: ${reason}`, autoClockOutResult.timeEntryId);
      }
      
      logger.info(`Force disconnect: User ${userId} from location ${locationId}, reason: ${reason}`);
      
      return { success: true, wifiStatus };
    } catch (error) {
      logger.error('Force disconnect error:', error);
      return { success: false, message: 'Force disconnect failed' };
    }
  }
}

module.exports = WiFiTrackingService; 