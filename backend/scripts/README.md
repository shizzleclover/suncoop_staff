# Backend Scripts

This directory contains utility scripts for database management and maintenance.

## Clear All Users Script

**⚠️ DANGER: Use with extreme caution!**

### Purpose
The `clearAllUsers.js` script is designed to completely wipe all user data from your database before launching to production. This ensures you start with a clean slate.

### What it clears:
- ✅ All user accounts (admin and staff)
- ✅ All shift assignments
- ✅ All time entries 
- ✅ All notifications
- ✅ User references in other models

### What it preserves:
- ✅ Location data
- ✅ Shift templates (unassigned shifts)
- ✅ System configuration

### Usage

1. **Make sure you have a backup!** This operation is irreversible.

2. **Run the script:**
   ```bash
   npm run clear-users
   ```
   
   Or directly:
   ```bash
   node scripts/clearAllUsers.js
   ```

3. **Follow the prompts:**
   - You'll need to type exactly: `CLEAR ALL USERS`
   - Then type: `I UNDERSTAND THIS IS IRREVERSIBLE`
   - Finally type: `YES`

### Safety Features

- **Triple confirmation** - Must enter exact phrases to proceed
- **Database statistics** - Shows what will be deleted before proceeding
- **Transaction safety** - Uses MongoDB transactions for data consistency
- **Verification** - Confirms deletion was successful
- **Graceful error handling** - Rolls back on failure

### Environment Requirements

- Must have `MONGODB_URI` set in your `.env` file
- Node.js environment with all dependencies installed
- Database connection permissions

### When to Use

- ✅ Before production launch (to remove test data)
- ✅ When resetting development environment
- ✅ During deployment preparation

### When NOT to Use

- ❌ On production database with real users
- ❌ Without proper backups
- ❌ If you're unsure about the consequences

### Recovery

If you accidentally run this script:
1. **Stop immediately** if it's still running (Ctrl+C)
2. **Restore from backup** - this is your only option
3. **There is no undo** - the data is permanently deleted

### Example Output

```
🚀 Starting Clear All Users Script

📊 Current database statistics:
Users: 25
User breakdown: { admin: 2, staff: 23 }
Shifts: 150
Time entries: 89
Notifications: 234

🚨 WARNING: This script will permanently delete ALL user data! 🚨

Type "CLEAR ALL USERS" to continue: CLEAR ALL USERS
Type "I UNDERSTAND THIS IS IRREVERSIBLE" to confirm: I UNDERSTAND THIS IS IRREVERSIBLE
Are you absolutely sure? Type "YES" to proceed: YES

🗑️ Proceeding with data deletion...
✅ Deleted 234 notifications
✅ Deleted 89 time entries
✅ Updated 45 shifts (removed assignments)
✅ Deleted 25 users
🎉 All user data has been successfully cleared!

🔍 Verification results:
Users remaining: 0
Notifications remaining: 0
Time entries remaining: 0
Assigned shifts remaining: 0
✅ All user data has been successfully cleared!

🎉 Script completed successfully!
Your database is now ready for production launch.
```

## Support

If you encounter issues:
1. Check your `.env` file has correct database connection
2. Ensure all dependencies are installed
3. Verify database permissions
4. Check the logs for specific error messages

For additional help, contact the development team. 