#!/usr/bin/env node

/**
 * Clear All Users Script
 * This script clears all user data and related records from the database
 * for a clean production launch.
 * 
 * DANGER: This script will permanently delete ALL user data!
 * Use with extreme caution and only for production launch preparation.
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Import models
const User = require('../src/models/User');
const Shift = require('../src/models/Shift');
const TimeEntry = require('../src/models/TimeEntry');
const Notification = require('../src/models/Notification');
// Import other models if they exist and reference users
// const Location = require('../src/models/Location'); // Uncomment if locations are user-specific

const logger = require('../src/utils/logger');

// Configuration
const CONFIRMATION_PHRASE = 'CLEAR ALL USERS';
const BACKUP_CONFIRMATION = 'I UNDERSTAND THIS IS IRREVERSIBLE';

/**
 * Connect to database
 */
async function connectDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    logger.info('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    logger.info(`✅ Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Get user confirmation with double verification
 */
async function getUserConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n🚨 WARNING: This script will permanently delete ALL user data! 🚨\n');
    console.log('This includes:');
    console.log('- All user accounts (admin and staff)');
    console.log('- All shift assignments');
    console.log('- All time entries');
    console.log('- All notifications');
    console.log('- All user-related data');
    console.log('\nThis action is IRREVERSIBLE and should only be used for production launch preparation.');
    
    rl.question(`\nType "${CONFIRMATION_PHRASE}" to continue: `, (answer1) => {
      if (answer1.trim() !== CONFIRMATION_PHRASE) {
        console.log('❌ Operation cancelled. Phrase did not match.');
        rl.close();
        resolve(false);
        return;
      }

      rl.question(`\nType "${BACKUP_CONFIRMATION}" to confirm you understand this is irreversible: `, (answer2) => {
        if (answer2.trim() !== BACKUP_CONFIRMATION) {
          console.log('❌ Operation cancelled. Confirmation phrase did not match.');
          rl.close();
          resolve(false);
          return;
        }

        rl.question('\nAre you absolutely sure? Type "YES" to proceed: ', (answer3) => {
          rl.close();
          resolve(answer3.trim().toLowerCase() === 'yes');
        });
      });
    });
  });
}

/**
 * Get database statistics before clearing
 */
async function getStatistics() {
  try {
    const stats = {
      users: await User.countDocuments(),
      shifts: await Shift.countDocuments(),
      timeEntries: await TimeEntry.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    // Get user role breakdown
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    stats.usersByRole = usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return stats;
  } catch (error) {
    logger.error('Error getting statistics:', error);
    return null;
  }
}

/**
 * Clear all user-related data
 */
async function clearAllUserData() {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      logger.info('🗑️  Starting data deletion...');

      // 1. Clear notifications (should be first to avoid foreign key issues)
      logger.info('Deleting notifications...');
      const notificationResult = await Notification.deleteMany({}, { session });
      logger.info(`✅ Deleted ${notificationResult.deletedCount} notifications`);

      // 2. Clear time entries
      logger.info('Deleting time entries...');
      const timeEntryResult = await TimeEntry.deleteMany({}, { session });
      logger.info(`✅ Deleted ${timeEntryResult.deletedCount} time entries`);

      // 3. Clear shift assignments and user-created shifts
      logger.info('Clearing shift assignments and user-created shifts...');
      const shiftUpdateResult = await Shift.updateMany(
        { assignedTo: { $ne: null } },
        { 
          $unset: { 
            assignedTo: 1,
            'autoUnbooking.noShowExplanation.userId': 1,
            'autoUnbooking.noShowExplanation.reviewedBy': 1
          },
          $set: { 
            status: 'AVAILABLE',
            currentCapacity: 0
          }
        },
        { session }
      );
      logger.info(`✅ Updated ${shiftUpdateResult.modifiedCount} shifts (removed assignments)`);

      // 4. Delete shifts created by users (optional - uncomment if you want to delete all shifts)
      // const shiftDeleteResult = await Shift.deleteMany({}, { session });
      // logger.info(`✅ Deleted ${shiftDeleteResult.deletedCount} shifts`);

      // 5. Clear users (LAST to maintain referential integrity during the process)
      logger.info('Deleting users...');
      const userResult = await User.deleteMany({}, { session });
      logger.info(`✅ Deleted ${userResult.deletedCount} users`);

      // 6. Reset any auto-increment counters or sequences if you have them
      // Add any additional cleanup here

      logger.info('🎉 All user data has been successfully cleared!');
      
      return {
        users: userResult.deletedCount,
        notifications: notificationResult.deletedCount,
        timeEntries: timeEntryResult.deletedCount,
        shiftsUpdated: shiftUpdateResult.modifiedCount
      };
    });

    logger.info('✅ Transaction completed successfully');
    
  } catch (error) {
    logger.error('❌ Error during data deletion:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Verify data has been cleared
 */
async function verifyDataCleared() {
  try {
    const verification = {
      users: await User.countDocuments(),
      notifications: await Notification.countDocuments(),
      timeEntries: await TimeEntry.countDocuments(),
      assignedShifts: await Shift.countDocuments({ assignedTo: { $ne: null } })
    };

    logger.info('🔍 Verification results:');
    logger.info(`Users remaining: ${verification.users}`);
    logger.info(`Notifications remaining: ${verification.notifications}`);
    logger.info(`Time entries remaining: ${verification.timeEntries}`);
    logger.info(`Assigned shifts remaining: ${verification.assignedShifts}`);

    const allCleared = Object.values(verification).every(count => count === 0);
    
    if (allCleared) {
      logger.info('✅ All user data has been successfully cleared!');
    } else {
      logger.warn('⚠️  Some data may not have been cleared. Please check manually.');
    }

    return verification;
  } catch (error) {
    logger.error('Error during verification:', error);
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    logger.info('🚀 Starting Clear All Users Script');
    
    // Connect to database
    await connectDatabase();

    // Get current statistics
    logger.info('\n📊 Current database statistics:');
    const beforeStats = await getStatistics();
    if (beforeStats) {
      console.log('Users:', beforeStats.users);
      console.log('User breakdown:', beforeStats.usersByRole);
      console.log('Shifts:', beforeStats.shifts);
      console.log('Time entries:', beforeStats.timeEntries);
      console.log('Notifications:', beforeStats.notifications);
    }

    // Get user confirmation
    const confirmed = await getUserConfirmation();
    
    if (!confirmed) {
      logger.info('❌ Operation cancelled by user');
      process.exit(0);
    }

    // Clear all data
    logger.info('\n🗑️  Proceeding with data deletion...');
    const results = await clearAllUserData();

    // Verify results
    logger.info('\n🔍 Verifying deletion...');
    await verifyDataCleared();

    logger.info('\n🎉 Script completed successfully!');
    logger.info('Your database is now ready for production launch.');
    
  } catch (error) {
    logger.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('📝 Database connection closed');
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('\n⚠️  Process interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\n⚠️  Process terminated');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Execute the script
if (require.main === module) {
  main();
}

module.exports = {
  connectDatabase,
  clearAllUserData,
  verifyDataCleared,
  getStatistics
}; 