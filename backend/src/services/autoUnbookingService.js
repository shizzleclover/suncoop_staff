/**
 * Auto Unbooking Service
 * Handles automatic shift unbooking when users fail to clock in within grace period
 */

const Shift = require('../models/Shift');
const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
const WiFiStatus = require('../models/WiFiStatus');
const logger = require('../utils/logger');
const { emitShiftUpdate, emitNotification } = require('../socket');

class AutoUnbookingService {
  /**
   * Check for shifts that should be auto-unbooked
   */
  static async checkShiftsForAutoUnbooking() {
    try {
      const now = new Date();
      const gracePeriodEnd = new Date(now.getTime() - (10 * 60 * 1000)); // 10 minutes ago
      
      // Find shifts that started more than grace period ago and user hasn't clocked in
      const shiftsToCheck = await Shift.find({
        status: 'BOOKED',
        assignedTo: { $ne: null },
        startTime: { $lte: gracePeriodEnd },
        'autoUnbooking.isAutoUnbookingEnabled': true,
        'autoUnbooking.autoUnbookedAt': null
      }).populate(['assignedTo', 'locationId']);
      
      logger.info(`Checking ${shiftsToCheck.length} shifts for auto-unbooking`);
      
      for (const shift of shiftsToCheck) {
        await this.processShiftForUnbooking(shift);
      }
      
      return { success: true, checkedShifts: shiftsToCheck.length };
    } catch (error) {
      logger.error('Auto-unbooking check error:', error);
      return { success: false, message: 'Auto-unbooking check failed' };
    }
  }
  
  /**
   * Process individual shift for potential unbooking
   */
  static async processShiftForUnbooking(shift) {
    try {
      const userId = shift.assignedTo._id;
      const locationId = shift.locationId._id;
      const gracePeriodMinutes = shift.autoUnbooking.gracePeriodMinutes || 10;
      
      // Check if user has clocked in for this shift
      const timeEntry = await TimeEntry.findOne({
        userId,
        shiftId: shift._id,
        status: { $in: ['clocked_in', 'completed'] }
      });
      
      if (timeEntry) {
        logger.info(`User ${userId} has clocked in for shift ${shift._id}, skipping auto-unbooking`);
        return { success: true, message: 'User has clocked in' };
      }
      
      // Check WiFi connection status as additional verification
      const wifiConnection = await WiFiStatus.findOne({
        userId,
        locationId,
        isConnected: true,
        isActive: true,
        connectionTime: { 
          $gte: new Date(shift.startTime.getTime() - (gracePeriodMinutes * 60 * 1000)),
          $lte: new Date()
        }
      });
      
      if (wifiConnection) {
        logger.info(`User ${userId} is connected to WiFi but hasn't clocked in, extending grace period`);
        // Extend grace period by 5 minutes if user is connected to WiFi
        const extendedGracePeriod = new Date(shift.startTime.getTime() + ((gracePeriodMinutes + 5) * 60 * 1000));
        if (new Date() < extendedGracePeriod) {
          return { success: true, message: 'Grace period extended due to WiFi connection' };
        }
      }
      
      // Proceed with auto-unbooking
      return await this.unbookShift(shift, 'no_show_grace_period_exceeded');
      
    } catch (error) {
      logger.error(`Error processing shift ${shift._id} for unbooking:`, error);
      return { success: false, message: 'Failed to process shift' };
    }
  }
  
  /**
   * Unbook a shift and mark as auto-unbooked
   */
  static async unbookShift(shift, reason) {
    try {
      const originalUserId = shift.assignedTo._id;
      const userName = shift.assignedTo.displayName || `${shift.assignedTo.firstName} ${shift.assignedTo.lastName}`;
      
      // Update shift status
      shift.status = 'AUTO_UNBOOKED';
      shift.autoUnbooking.autoUnbookedAt = new Date();
      shift.autoUnbooking.autoUnbookedReason = reason;
      
      // Clear assignment to make shift available again
      const previousAssignee = shift.assignedTo;
      shift.assignedTo = null;
      shift.currentCapacity = 0;
      
      await shift.save();
      
      // Create notification for the user who missed the shift
      const missedShiftNotification = await Notification.create({
        userId: originalUserId,
        type: 'shift_cancelled',
        title: 'Shift Auto-Unbooked',
        message: `Your shift at ${shift.locationId.name} has been automatically unbooked due to no-show. Please provide an explanation.`,
        priority: 'high',
        category: 'warning',
        data: {
          shiftId: shift._id,
          requiresExplanation: true,
          unbookingReason: reason
        }
      });
      
      // Create notification for admins
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      const adminNotifications = adminUsers.map(admin => ({
        userId: admin._id,
        type: 'shift_management',
        title: 'Shift Auto-Unbooked',
        message: `${userName}'s shift at ${shift.locationId.name} has been auto-unbooked due to no-show.`,
        priority: 'normal',
        category: 'info',
        data: {
          shiftId: shift._id,
          originalUserId: originalUserId,
          reason: reason
        }
      }));
      
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
      
      // Make shift available again
      const updatedShift = await Shift.findByIdAndUpdate(
        shift._id,
        { status: 'AVAILABLE' },
        { new: true }
      ).populate(['locationId']);
      
      // Emit real-time updates
      emitShiftUpdate(shift._id, 'shift:auto_unbooked', {
        shift: updatedShift,
        originalUserId,
        reason
      });
      
      emitNotification(originalUserId, missedShiftNotification);
      
      // Notify all admins
      adminUsers.forEach(admin => {
        const adminNotification = adminNotifications.find(notif => 
          notif.userId.toString() === admin._id.toString()
        );
        if (adminNotification) {
          emitNotification(admin._id, adminNotification);
        }
      });
      
      logger.info(`Shift auto-unbooked: ${shift._id}, user: ${originalUserId}, reason: ${reason}`);
      
      return { 
        success: true, 
        shiftId: shift._id, 
        originalUserId,
        reason 
      };
      
    } catch (error) {
      logger.error(`Error unbooking shift ${shift._id}:`, error);
      return { success: false, message: 'Failed to unbook shift' };
    }
  }
  
  /**
   * Submit explanation for missed shift
   */
  static async submitMissedShiftExplanation(userId, shiftId, explanation) {
    try {
      if (!explanation || explanation.trim().length < 10) {
        return { success: false, message: 'Explanation must be at least 10 characters long' };
      }
      
      const shift = await Shift.findById(shiftId);
      if (!shift) {
        return { success: false, message: 'Shift not found' };
      }
      
      if (shift.status !== 'AUTO_UNBOOKED') {
        return { success: false, message: 'This shift was not auto-unbooked' };
      }
      
      // Check if explanation already submitted
      if (shift.autoUnbooking.noShowExplanation?.submittedAt) {
        return { success: false, message: 'Explanation already submitted' };
      }
      
      // Save explanation
      shift.autoUnbooking.noShowExplanation = {
        userId,
        explanation: explanation.trim(),
        submittedAt: new Date(),
        isApproved: false
      };
      
      await shift.save();
      
      // Create notification for admins
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      const user = await User.findById(userId);
      
      const adminNotifications = adminUsers.map(admin => ({
        userId: admin._id,
        type: 'shift_management',
        title: 'Missed Shift Explanation Submitted',
        message: `${user.displayName} has submitted an explanation for missing their shift.`,
        priority: 'normal',
        category: 'info',
        data: {
          shiftId: shift._id,
          explanationUserId: userId,
          explanation: explanation.trim()
        },
        actionUrl: `/admin/shifts/${shiftId}/explanation`,
        actionText: 'Review Explanation'
      }));
      
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        
        // Emit notifications to admins
        adminUsers.forEach(admin => {
          const adminNotification = adminNotifications.find(notif => 
            notif.userId.toString() === admin._id.toString()
          );
          if (adminNotification) {
            emitNotification(admin._id, adminNotification);
          }
        });
      }
      
      // Create confirmation notification for user
      const userNotification = await Notification.create({
        userId,
        type: 'shift_management',
        title: 'Explanation Submitted',
        message: 'Your explanation for the missed shift has been submitted and is under review.',
        priority: 'normal',
        category: 'success'
      });
      
      emitNotification(userId, userNotification);
      
      logger.info(`Missed shift explanation submitted: Shift ${shiftId}, User ${userId}`);
      
      return { success: true, message: 'Explanation submitted successfully' };
      
    } catch (error) {
      logger.error('Submit explanation error:', error);
      return { success: false, message: 'Failed to submit explanation' };
    }
  }
  
  /**
   * Review missed shift explanation (admin)
   */
  static async reviewMissedShiftExplanation(adminUserId, shiftId, isApproved, adminNotes = '') {
    try {
      const shift = await Shift.findById(shiftId).populate('autoUnbooking.noShowExplanation.userId');
      if (!shift) {
        return { success: false, message: 'Shift not found' };
      }
      
      if (!shift.autoUnbooking.noShowExplanation?.submittedAt) {
        return { success: false, message: 'No explanation found to review' };
      }
      
      if (shift.autoUnbooking.noShowExplanation.reviewedAt) {
        return { success: false, message: 'Explanation already reviewed' };
      }
      
      // Update explanation review
      shift.autoUnbooking.noShowExplanation.isApproved = isApproved;
      shift.autoUnbooking.noShowExplanation.reviewedBy = adminUserId;
      shift.autoUnbooking.noShowExplanation.reviewedAt = new Date();
      shift.autoUnbooking.noShowExplanation.adminNotes = adminNotes.trim();
      
      await shift.save();
      
      // Create notification for user
      const explanationUserId = shift.autoUnbooking.noShowExplanation.userId._id;
      const statusText = isApproved ? 'approved' : 'rejected';
      const categoryType = isApproved ? 'success' : 'warning';
      
      const userNotification = await Notification.create({
        userId: explanationUserId,
        type: 'shift_management',
        title: `Missed Shift Explanation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        message: `Your explanation for the missed shift has been ${statusText}.${adminNotes ? ` Admin notes: ${adminNotes}` : ''}`,
        priority: 'normal',
        category: categoryType,
        data: {
          shiftId: shift._id,
          isApproved,
          adminNotes
        }
      });
      
      emitNotification(explanationUserId, userNotification);
      
      // If not approved, user may face restrictions (implement as needed)
      if (!isApproved) {
        // Could implement temporary booking restrictions here
        logger.warn(`Missed shift explanation rejected: Shift ${shiftId}, User ${explanationUserId}`);
      }
      
      logger.info(`Missed shift explanation reviewed: Shift ${shiftId}, User ${explanationUserId}, Approved: ${isApproved}`);
      
      return { 
        success: true, 
        message: `Explanation ${statusText} successfully`,
        isApproved,
        shiftId,
        explanationUserId
      };
      
    } catch (error) {
      logger.error('Review explanation error:', error);
      return { success: false, message: 'Failed to review explanation' };
    }
  }
  
  /**
   * Get pending explanations for admin review
   */
  static async getPendingExplanations() {
    try {
      const shifts = await Shift.find({
        status: 'AUTO_UNBOOKED',
        'autoUnbooking.noShowExplanation.submittedAt': { $ne: null },
        'autoUnbooking.noShowExplanation.reviewedAt': null
      }).populate([
        'locationId',
        'autoUnbooking.noShowExplanation.userId'
      ]).sort({ 'autoUnbooking.noShowExplanation.submittedAt': -1 });
      
      return { success: true, pendingExplanations: shifts };
    } catch (error) {
      logger.error('Get pending explanations error:', error);
      return { success: false, message: 'Failed to get pending explanations' };
    }
  }
  
  /**
   * Get user's missed shifts requiring explanations
   */
  static async getUserMissedShifts(userId) {
    try {
      const shifts = await Shift.find({
        status: 'AUTO_UNBOOKED',
        'autoUnbooking.noShowExplanation.userId': userId
      }).populate(['locationId']).sort({ 'autoUnbooking.autoUnbookedAt': -1 });
      
      return { success: true, missedShifts: shifts };
    } catch (error) {
      logger.error('Get user missed shifts error:', error);
      return { success: false, message: 'Failed to get missed shifts' };
    }
  }
  
  /**
   * Check if user has pending explanations
   */
  static async hasPendingExplanations(userId) {
    try {
      const count = await Shift.countDocuments({
        status: 'AUTO_UNBOOKED',
        'autoUnbooking.noShowExplanation.userId': userId,
        'autoUnbooking.noShowExplanation.submittedAt': null
      });
      
      return count > 0;
    } catch (error) {
      logger.error('Check pending explanations error:', error);
      return false;
    }
  }
  
  /**
   * Clean up old auto-unbooked shifts
   */
  static async cleanupOldShifts(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await Shift.deleteMany({
        status: 'AUTO_UNBOOKED',
        'autoUnbooking.autoUnbookedAt': { $lt: cutoffDate }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} old auto-unbooked shifts`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      logger.error('Cleanup old shifts error:', error);
      return { success: false, message: 'Cleanup failed' };
    }
  }
}

module.exports = AutoUnbookingService;
