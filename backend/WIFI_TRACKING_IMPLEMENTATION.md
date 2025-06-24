# WiFi-Based Clock In/Out System Implementation

## Overview

This document outlines the implementation of a sophisticated WiFi-based automatic time tracking system for the SunCoop Staff Management application. The system automatically handles staff clock-in/out based on WiFi connectivity and includes auto-unbooking functionality for missed shifts.

## Features Implemented

### 1. WiFi-Based Time Tracking
- **Automatic Clock In**: Staff automatically clock in when connecting to designated office WiFi
- **Automatic Clock Out**: Staff automatically clock out when disconnecting from office WiFi
- **Grace Period**: Configurable delay before auto clock-out to handle brief disconnections
- **Real-time Monitoring**: Live WiFi connection status tracking via WebSocket

### 2. Auto-Unbooking System
- **Grace Period**: 10-minute grace period for staff to clock in after shift start
- **Automatic Unbooking**: Shifts automatically unbooked if staff fail to clock in within grace period
- **Explanation Requirement**: Staff must provide explanations for missed shifts
- **Admin Review**: Admins can review and approve/reject explanations

### 3. Admin Configuration
- **WiFi SSID Configuration**: Admins can set designated office WiFi networks per location
- **Tracking Settings**: Configurable grace periods and auto-disconnect delays
- **Real-time Monitoring**: Live dashboard showing WiFi connections and auto-tracking events

## Technical Implementation

### Database Models

#### Updated Location Model
```javascript
wifiSettings: {
  ssid: String,                    // Office WiFi network name
  isWifiTrackingEnabled: Boolean,  // Enable/disable WiFi tracking
  wifiTrackingGracePeriod: Number, // Grace period in seconds
  autoClockOutDelay: Number        // Delay before auto clock-out
}
```

#### New WiFiStatus Model
```javascript
{
  userId: ObjectId,              // Reference to User
  locationId: ObjectId,          // Reference to Location
  shiftId: ObjectId,            // Reference to Shift (optional)
  ssid: String,                 // WiFi network name
  isConnected: Boolean,         // Connection status
  connectionTime: Date,         // When connected
  disconnectionTime: Date,      // When disconnected
  deviceInfo: Object,           // Device information
  location: Object,             // GPS coordinates
  isActive: Boolean,            // Status active/inactive
  autoActions: [Object]         // Auto clock in/out actions
}
```

#### Updated TimeEntry Model
```javascript
wifiTracking: {
  isWifiBasedEntry: Boolean,      // Entry created via WiFi
  clockInWifiSSID: String,        // WiFi network for clock in
  clockOutWifiSSID: String,       // WiFi network for clock out
  autoClockOutReasons: [Object],  // Reasons for auto clock out
  wifiConnectionLogs: [Object]    // Connection event logs
}
```

#### Updated Shift Model
```javascript
autoUnbooking: {
  isAutoUnbookingEnabled: Boolean,  // Enable auto-unbooking
  gracePeriodMinutes: Number,       // Grace period (default 10)
  autoUnbookedAt: Date,            // When auto-unbooked
  autoUnbookedReason: String,      // Reason for unbooking
  noShowExplanation: {
    userId: ObjectId,               // User who missed shift
    explanation: String,            // User's explanation
    submittedAt: Date,             // When submitted
    reviewedBy: ObjectId,          // Admin who reviewed
    reviewedAt: Date,              // When reviewed
    isApproved: Boolean,           // Approval status
    adminNotes: String             // Admin's notes
  }
}
```

### Services

#### WiFiTrackingService
- `reportWiFiStatus()` - Process WiFi connection reports from clients
- `handleAutoClockIn()` - Automatic clock-in logic
- `handleAutoClockOut()` - Automatic clock-out logic
- `getUserWiFiStatus()` - Get user's current WiFi status
- `getConnectionHistory()` - Get user's WiFi connection history
- `getLocationConnections()` - Get all connections for a location
- `forceDisconnect()` - Admin force disconnect functionality

#### AutoUnbookingService
- `checkShiftsForAutoUnbooking()` - Check shifts that should be auto-unbooked
- `processShiftForUnbooking()` - Process individual shift for unbooking
- `unbookShift()` - Unbook shift and create notifications
- `submitMissedShiftExplanation()` - Submit explanation for missed shift
- `reviewMissedShiftExplanation()` - Admin review of explanations
- `getPendingExplanations()` - Get explanations awaiting review

#### CronJobService
- `initializeJobs()` - Initialize all scheduled tasks
- `scheduleAutoUnbookingCheck()` - Every 2 minutes check for auto-unbooking
- `scheduleWiFiCleanup()` - Daily cleanup of old WiFi records
- `scheduleTimeEntryHealthCheck()` - Check for stuck time entries
- `executeJobManually()` - Manual execution for testing

### API Endpoints

#### Staff Endpoints
```
POST /api/wifi-tracking/status              - Report WiFi status
GET  /api/wifi-tracking/status              - Get current WiFi status
GET  /api/wifi-tracking/history             - Get connection history
POST /api/wifi-tracking/missed-shift/explanation - Submit explanation
GET  /api/wifi-tracking/missed-shifts       - Get missed shifts
GET  /api/wifi-tracking/pending-explanations/check - Check pending explanations
```

#### Admin Endpoints
```
GET  /api/wifi-tracking/location/:id/connections - Get location connections
POST /api/wifi-tracking/force-disconnect         - Force disconnect user
POST /api/wifi-tracking/missed-shift/review      - Review explanations
GET  /api/wifi-tracking/pending-explanations     - Get pending explanations
GET  /api/wifi-tracking/stats                    - Get tracking statistics
GET  /api/wifi-tracking/health                   - System health check
POST /api/wifi-tracking/admin/execute-job        - Manual job execution
GET  /api/wifi-tracking/admin/jobs               - Get job status
```

### Real-time Updates (WebSocket)

#### Client Events
- `wifi:subscribe` - Subscribe to WiFi updates for a location
- `wifi:unsubscribe` - Unsubscribe from WiFi updates
- `wifi:status` - Report WiFi connection status

#### Server Events
- `wifi:status:confirmed` - WiFi status update confirmed
- `wifi:status:error` - WiFi status error
- `wifi:status:update` - Real-time WiFi status update
- `timeTracking:auto_clock_out` - Auto clock-out notification
- `shift:auto_unbooked` - Shift auto-unbooking notification

### Cron Jobs

#### Auto-Unbooking Check (Every 2 minutes)
- Checks for shifts that should be auto-unbooked
- Extends grace period if user is connected to WiFi
- Creates notifications for staff and admins
- Makes shifts available again

#### WiFi Cleanup (Daily at 2 AM)
- Removes old WiFi status records (30+ days)
- Cleans up inactive connections

#### Time Entry Health Check (Every 30 minutes)
- Identifies stuck time entries (24+ hours)
- Auto clock-out users who are no longer connected
- System recovery for edge cases

#### Shift Cleanup (Weekly on Sunday at 3 AM)
- Removes old auto-unbooked shifts (90+ days)
- Database maintenance

## Configuration

### Environment Variables
```bash
TZ=America/New_York                    # Timezone for cron jobs
WIFI_TRACKING_ENABLED=true             # Enable WiFi tracking
AUTO_UNBOOKING_ENABLED=true            # Enable auto-unbooking
WIFI_CLEANUP_DAYS=30                   # Days to keep WiFi records
SHIFT_CLEANUP_DAYS=90                  # Days to keep auto-unbooked shifts
```

### Location Configuration
Admins can configure per location:
- WiFi SSID for tracking
- Enable/disable WiFi tracking
- Grace period for reconnection (default: 5 minutes)
- Auto clock-out delay (default: 1 minute)

### Shift Configuration
- Auto-unbooking grace period (default: 10 minutes)
- Enable/disable auto-unbooking per shift type

## Security Considerations

### WiFi Verification
- SSID must match location configuration
- Device fingerprinting for additional security
- Location validation (GPS coordinates)

### Admin Controls
- Force disconnect capabilities
- Manual job execution for testing
- Real-time monitoring dashboard
- Audit trails for all auto-actions

### Data Privacy
- WiFi status records are automatically cleaned up
- Device information is anonymized after cleanup
- GPS coordinates are only used for verification

## Monitoring and Health Checks

### System Health Endpoint
`GET /api/wifi-tracking/health`
- Cron job status
- Recent WiFi activity
- Active connections count
- System operational status

### Admin Dashboard
- Real-time WiFi connections
- Auto-tracking statistics
- Pending explanations count
- Job execution history

### Logging
- All WiFi events logged with INFO level
- Auto clock in/out events logged
- Error conditions logged with ERROR level
- Admin actions logged with WARN level

## Error Handling

### Connection Issues
- Grace periods prevent false disconnections
- Health checks recover stuck entries
- Automatic retries for failed operations

### Data Validation
- SSID validation against location settings
- User authentication for all operations
- Shift validation for auto-tracking

### Fallback Mechanisms
- Manual clock in/out always available
- Admin override capabilities
- System recovery procedures

## Testing

### Manual Job Execution
```bash
# Test auto-unbooking
POST /api/wifi-tracking/admin/execute-job
{ "jobName": "auto-unbooking-check" }

# Test WiFi cleanup
POST /api/wifi-tracking/admin/execute-job
{ "jobName": "wifi-cleanup" }
```

### Health Monitoring
```bash
# Check system health
GET /api/wifi-tracking/health

# Get job statistics
GET /api/wifi-tracking/admin/jobs
```

## Future Enhancements

### Planned Features
- Bluetooth proximity tracking
- Facial recognition integration
- Geofencing for outdoor locations
- Machine learning for pattern detection
- Mobile app optimizations

### Scalability
- Redis caching for high-traffic locations
- Database indexing optimizations
- Microservice architecture considerations
- Load balancing for cron jobs

## Deployment Notes

### Prerequisites
- Node.js 18+ with node-cron package
- MongoDB with proper indexing
- WebSocket support enabled
- Timezone configuration

### Installation
1. Install dependencies: `npm install`
2. Configure environment variables
3. Run database migrations
4. Initialize cron jobs on server start
5. Test with manual job execution

### Monitoring
- Set up log aggregation for WiFi events
- Configure alerts for failed auto-operations
- Monitor cron job execution status
- Track system performance metrics

This implementation provides a robust, scalable WiFi-based time tracking system with comprehensive admin controls and automatic fallback mechanisms. 