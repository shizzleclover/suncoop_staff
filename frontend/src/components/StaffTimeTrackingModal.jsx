import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  X, 
  User, 
  Building2, 
  Timer,
  CheckCircle,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from './LoadingSpinner';
import { timeTrackingApi } from '@/lib/api';
import { formatTime, formatDate, formatDateShort } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const StaffTimeTrackingModal = ({ isOpen, onClose, staffMember }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (isOpen && staffMember) {
      loadTimeTrackingData();
    }
  }, [isOpen, staffMember]);

  const loadTimeTrackingData = async () => {
    if (!staffMember) return;

    setIsLoading(true);
    try {
      // Get time entries for the staff member
      const response = await timeTrackingApi.getTimeEntries({
        userId: staffMember._id,
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      const entries = response.data.timeEntries || [];
      setTimeEntries(entries);

      // Find current active time entry
      const activeEntry = entries.find(entry => entry.status === 'clocked_in');
      setCurrentTimeEntry(activeEntry);

    } catch (error) {
      console.error('Failed to load time tracking data:', error);
      toast.error('Failed to load time tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'clocked_in': { color: 'bg-blue-100 text-blue-800', label: 'Clocked In' },
      'clocked_out': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge className={`${config.color} text-xs font-medium px-2 py-1`}>
        {config.label}
      </Badge>
    );
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown Location';
    
    if (typeof location === 'string') return location;
    
    if (location.address) return location.address;
    if (location.formatted) return location.formatted;
    if (location.latitude && location.longitude) {
      return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }
    
    return 'Location data available';
  };

  const calculateDuration = (clockIn, clockOut) => {
    if (!clockIn) return 'N/A';
    if (!clockOut) return 'In Progress';
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const TimeEntryCard = ({ entry }) => {
    const isActive = entry.status === 'clocked_in';
    
    return (
      <Card className={`mb-3 ${isActive ? 'border-blue-500 bg-blue-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Clock className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {formatDate(entry.date)}
                </h4>
                <p className="text-sm text-gray-600">
                  {entry.shiftId ? (
                    <span>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {entry.shiftId.description || 'Shift Work'}
                    </span>
                  ) : (
                    'General Time Entry'
                  )}
                </p>
              </div>
            </div>
            {getStatusBadge(entry.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clock In Details */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Clock In
              </h5>
              {entry.clockInTime ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {formatTime(entry.clockInTime)}
                  </p>
                  {entry.clockInLocation && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {formatLocation(entry.clockInLocation)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No clock-in recorded</p>
              )}
            </div>

            {/* Clock Out Details */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Timer className="w-3 h-3 text-red-600" />
                Clock Out
              </h5>
              {entry.clockOutTime ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {formatTime(entry.clockOutTime)}
                  </p>
                  {entry.clockOutLocation && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {formatLocation(entry.clockOutLocation)}
                      </p>
                    </div>
                  )}
                </div>
              ) : isActive ? (
                <p className="text-sm text-blue-600 font-medium">Currently Active</p>
              ) : (
                <p className="text-sm text-gray-500">No clock-out recorded</p>
              )}
            </div>
          </div>

          {/* Duration and Location Info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>Duration: {calculateDuration(entry.clockInTime, entry.clockOutTime)}</span>
              </div>
              {entry.locationId && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>
                    {typeof entry.locationId === 'object' 
                      ? entry.locationId.name 
                      : 'Location ID: ' + entry.locationId}
                  </span>
                </div>
              )}
              {entry.hoursWorked && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Hours: {entry.hoursWorked.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {entry.adminNotes && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Admin Notes:</strong> {entry.adminNotes}
              </p>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs text-gray-700">
                <strong>Notes:</strong> {entry.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const CurrentStatusCard = () => {
    if (!currentTimeEntry) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Not Currently Clocked In</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Staff member is not currently tracking time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const clockInTime = new Date(currentTimeEntry.clockInTime);
    const now = new Date();
    const elapsedMs = now - clockInTime;
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Currently Clocked In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Clock In Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(currentTimeEntry.clockInTime)}</span>
                </div>
                {currentTimeEntry.clockInLocation && (
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">
                      {formatLocation(currentTimeEntry.clockInLocation)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Current Session</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Timer className="w-3 h-3" />
                  <span>Elapsed: {elapsedHours}h {elapsedMinutes}m</span>
                </div>
                {currentTimeEntry.shiftId && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Calendar className="w-3 h-3" />
                    <span>{currentTimeEntry.shiftId.description || 'Shift Work'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {currentTimeEntry.locationId && (
            <div className="pt-3 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Building2 className="w-3 h-3" />
                <span>
                  Location: {typeof currentTimeEntry.locationId === 'object' 
                    ? currentTimeEntry.locationId.name 
                    : 'Location ID: ' + currentTimeEntry.locationId}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!staffMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {staffMember.firstName} {staffMember.lastName}
                </DialogTitle>
                <p className="text-sm text-gray-600">Time Tracking Details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner text="Loading time tracking data..." />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Current Status
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time History ({timeEntries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="flex-1 overflow-auto">
                <div className="space-y-4 pr-2">
                  <CurrentStatusCard />
                  
                  {/* Recent entries */}
                  {timeEntries.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Recent Time Entries
                      </h3>
                      <div className="space-y-3">
                        {timeEntries.slice(0, 3).map((entry) => (
                          <TimeEntryCard key={entry._id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-auto">
                <div className="space-y-3 pr-2">
                  {timeEntries.length > 0 ? (
                    timeEntries.map((entry) => (
                      <TimeEntryCard key={entry._id} entry={entry} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No Time Entries</p>
                      <p className="text-sm">This staff member hasn't recorded any time entries yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffTimeTrackingModal; 