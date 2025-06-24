/**
 * Cron Job Service
 * Handles scheduled tasks for WiFi tracking and auto-unbooking
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const WiFiTrackingService = require('./wifiTrackingService');
const AutoUnbookingService = require('./autoUnbookingService');

class CronJobService {
  constructor() {
    this.jobs = new Map();
  }
  
  /**
   * Initialize and start all cron jobs
   */
  initializeJobs() {
    logger.info('Initializing cron jobs...');
    
    // Auto-unbooking check - Every 2 minutes
    this.scheduleAutoUnbookingCheck();
    
    // WiFi status cleanup - Daily at 2 AM
    this.scheduleWiFiCleanup();
    
    // Health check for stuck time entries - Every 30 minutes
    this.scheduleTimeEntryHealthCheck();
    
    // Auto-unbooked shifts cleanup - Weekly on Sunday at 3 AM
    this.scheduleShiftCleanup();
    
    logger.info(`Initialized ${this.jobs.size} cron jobs`);
  }
  
  /**
   * Schedule auto-unbooking check job
   * Runs every 2 minutes to check for shifts that should be auto-unbooked
   */
  scheduleAutoUnbookingCheck() {
    const jobName = 'auto-unbooking-check';
    
    const job = cron.schedule('*/2 * * * *', async () => {
      try {
        logger.debug('Running auto-unbooking check...');
        const result = await AutoUnbookingService.checkShiftsForAutoUnbooking();
        
        if (result.success && result.checkedShifts > 0) {
          logger.info(`Auto-unbooking check completed: ${result.checkedShifts} shifts checked`);
        }
      } catch (error) {
        logger.error('Auto-unbooking cron job error:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });
    
    this.jobs.set(jobName, job);
    job.start();
    
    logger.info(`Scheduled job: ${jobName} - Every 2 minutes`);
  }
  
  /**
   * Schedule WiFi status cleanup job
   * Runs daily at 2 AM to clean up old WiFi status records
   */
  scheduleWiFiCleanup() {
    const jobName = 'wifi-cleanup';
    
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running WiFi status cleanup...');
        const result = await WiFiTrackingService.cleanupOldRecords(30); // Keep 30 days
        
        if (result.success) {
          logger.info(`WiFi cleanup completed: ${result.deletedCount} records deleted`);
        } else {
          logger.error('WiFi cleanup failed:', result.message);
        }
      } catch (error) {
        logger.error('WiFi cleanup cron job error:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });
    
    this.jobs.set(jobName, job);
    job.start();
    
    logger.info(`Scheduled job: ${jobName} - Daily at 2:00 AM`);
  }
  
  /**
   * Schedule time entry health check job
   * Runs every 30 minutes to check for stuck time entries
   */
  scheduleTimeEntryHealthCheck() {
    const jobName = 'time-entry-health-check';
    
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        logger.debug('Running time entry health check...');
        await this.checkStuckTimeEntries();
      } catch (error) {
        logger.error('Time entry health check cron job error:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });
    
    this.jobs.set(jobName, job);
    job.start();
    
    logger.info(`Scheduled job: ${jobName} - Every 30 minutes`);
  }
  
  /**
   * Schedule shift cleanup job
   * Runs weekly on Sunday at 3 AM to clean up old auto-unbooked shifts
   */
  scheduleShiftCleanup() {
    const jobName = 'shift-cleanup';
    
    const job = cron.schedule('0 3 * * 0', async () => {
      try {
        logger.info('Running shift cleanup...');
        const result = await AutoUnbookingService.cleanupOldShifts(90); // Keep 90 days
        
        if (result.success) {
          logger.info(`Shift cleanup completed: ${result.deletedCount} shifts deleted`);
        } else {
          logger.error('Shift cleanup failed:', result.message);
        }
      } catch (error) {
        logger.error('Shift cleanup cron job error:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });
    
    this.jobs.set(jobName, job);
    job.start();
    
    logger.info(`Scheduled job: ${jobName} - Weekly on Sunday at 3:00 AM`);
  }
  
  /**
   * Check for stuck time entries that should be auto-clocked out
   */
  async checkStuckTimeEntries() {
    try {
      const TimeEntry = require('../models/TimeEntry');
      const WiFiStatus = require('../models/WiFiStatus');
      const Location = require('../models/Location');
      
      // Find time entries that have been "clocked_in" for more than 24 hours
      const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      const stuckEntries = await TimeEntry.find({
        status: 'clocked_in',
        clockInTime: { $lt: oneDayAgo },
        'wifiTracking.isWifiBasedEntry': true
      }).populate(['userId', 'locationId']);
      
      for (const entry of stuckEntries) {
        // Check if user is still connected to WiFi
        const wifiConnection = await WiFiStatus.findOne({
          userId: entry.userId._id,
          locationId: entry.locationId._id,
          isConnected: true,
          isActive: true
        });
        
        if (!wifiConnection) {
          // User is not connected, auto clock out
          logger.warn(`Auto-clocking out stuck entry: ${entry._id}`);
          
          await entry.clockOut();
          entry.wifiTracking.autoClockOutReasons.push({
            reason: 'system_error',
            timestamp: new Date(),
            details: 'Auto clocked out due to stuck entry (24+ hours)'
          });
          
          await entry.save();
          
          // Create notification for user
          const Notification = require('../models/Notification');
          await Notification.create({
            userId: entry.userId._id,
            type: 'time_tracking',
            title: 'Auto Clock Out - System Recovery',
            message: `You have been automatically clocked out from ${entry.locationId.name} due to a system recovery process.`,
            priority: 'normal',
            category: 'info'
          });
        }
      }
      
      if (stuckEntries.length > 0) {
        logger.info(`Processed ${stuckEntries.length} potentially stuck time entries`);
      }
      
    } catch (error) {
      logger.error('Check stuck time entries error:', error);
    }
  }
  
  /**
   * Schedule a custom job
   */
  scheduleCustomJob(name, cronPattern, taskFunction, options = {}) {
    try {
      if (this.jobs.has(name)) {
        logger.warn(`Job ${name} already exists, stopping existing job`);
        this.stopJob(name);
      }
      
      const job = cron.schedule(cronPattern, taskFunction, {
        scheduled: false,
        timezone: options.timezone || process.env.TZ || 'UTC',
        ...options
      });
      
      this.jobs.set(name, job);
      job.start();
      
      logger.info(`Scheduled custom job: ${name} - ${cronPattern}`);
      return { success: true, jobName: name };
    } catch (error) {
      logger.error(`Error scheduling custom job ${name}:`, error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Stop a specific job
   */
  stopJob(jobName) {
    try {
      const job = this.jobs.get(jobName);
      if (job) {
        job.stop();
        this.jobs.delete(jobName);
        logger.info(`Stopped job: ${jobName}`);
        return { success: true };
      }
      
      return { success: false, message: 'Job not found' };
    } catch (error) {
      logger.error(`Error stopping job ${jobName}:`, error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Start a specific job
   */
  startJob(jobName) {
    try {
      const job = this.jobs.get(jobName);
      if (job) {
        job.start();
        logger.info(`Started job: ${jobName}`);
        return { success: true };
      }
      
      return { success: false, message: 'Job not found' };
    } catch (error) {
      logger.error(`Error starting job ${jobName}:`, error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Get status of all jobs
   */
  getJobsStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running || false,
        lastDate: job.lastDate || null,
        nextDate: job.nextDate || null
      };
    }
    
    return status;
  }
  
  /**
   * Stop all jobs
   */
  stopAllJobs() {
    logger.info('Stopping all cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    }
    
    this.jobs.clear();
    logger.info('All cron jobs stopped');
  }
  
  /**
   * Restart all jobs
   */
  restartAllJobs() {
    logger.info('Restarting all cron jobs...');
    this.stopAllJobs();
    this.initializeJobs();
  }
  
  /**
   * Execute a job manually (for testing)
   */
  async executeJobManually(jobName) {
    try {
      switch (jobName) {
        case 'auto-unbooking-check':
          return await AutoUnbookingService.checkShiftsForAutoUnbooking();
        
        case 'wifi-cleanup':
          return await WiFiTrackingService.cleanupOldRecords(30);
        
        case 'time-entry-health-check':
          await this.checkStuckTimeEntries();
          return { success: true, message: 'Health check completed' };
        
        case 'shift-cleanup':
          return await AutoUnbookingService.cleanupOldShifts(90);
        
        default:
          return { success: false, message: 'Unknown job name' };
      }
    } catch (error) {
      logger.error(`Error executing job ${jobName} manually:`, error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Get job execution statistics
   */
  getJobStats() {
    const stats = {
      totalJobs: this.jobs.size,
      runningJobs: 0,
      stoppedJobs: 0,
      nextExecution: null
    };
    
    const nextExecutions = [];
    
    for (const [name, job] of this.jobs) {
      if (job.running) {
        stats.runningJobs++;
        if (job.nextDate) {
          nextExecutions.push({
            job: name,
            nextDate: job.nextDate
          });
        }
      } else {
        stats.stoppedJobs++;
      }
    }
    
    if (nextExecutions.length > 0) {
      nextExecutions.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
      stats.nextExecution = nextExecutions[0];
    }
    
    return stats;
  }
}

// Create singleton instance
const cronJobService = new CronJobService();

module.exports = cronJobService; 