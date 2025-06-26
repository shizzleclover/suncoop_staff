import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, Loader2, Navigation, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import geolocationService from '@/services/geolocationService';
import { timeTrackingApi, shiftsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { formatTime, formatDate, isToday, isTomorrow } from '@/lib/utils';

const ClockInOutButton = ({ 
  locationId, 
  shiftId = null, 
  currentTimeEntry = null,
  onClockIn,
  onClockOut,
  className = ""
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('unknown'); // 'unknown', 'granted', 'denied', 'prompt'
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loadingShifts, setLoadingShifts] = useState(false);

  const isClockedIn = currentTimeEntry && currentTimeEntry.status === 'clocked_in';

  // Check location permissions on mount
  useEffect(() => {
    checkLocationPermissions();
    loadUserShifts();
  }, []);

  // Set selected shift if shiftId is provided
  useEffect(() => {
    if (shiftId && availableShifts.length > 0) {
      const shift = availableShifts.find(s => s._id === shiftId);
      if (shift) {
        setSelectedShift(shift);
      }
    }
  }, [shiftId, availableShifts]);

  const loadUserShifts = async () => {
    try {
      setLoadingShifts(true);
      // Get user's assigned shifts for today and near future
      const response = await shiftsApi.getUserShifts({
        startDate: new Date().toISOString(),
        limit: 10,
        status: 'BOOKED'
      });
      
      const shifts = response.data.shifts || [];
      // Show all available shifts for the user
      const validShifts = shifts;
      
      setAvailableShifts(validShifts);
    } catch (error) {
      console.error('Failed to load user shifts:', error);
      toast.error('Failed to load your shifts');
    } finally {
      setLoadingShifts(false);
    }
  };

  const checkLocationPermissions = async () => {
    if (!geolocationService.isGeolocationSupported()) {
      setLocationStatus('unsupported');
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    try {
      const permission = await geolocationService.checkPermissions();
      setLocationStatus(permission);
      
      if (permission === 'granted') {
        // Optionally get current location if permission is already granted
        // getCurrentLocation();
      }
    } catch (error) {
      console.warn('Could not check location permissions:', error);
      setLocationStatus('unknown');
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const result = await geolocationService.requestLocation();
      
      if (result.success) {
        setCurrentLocation(result.location);
        setLocationStatus('granted');
        toast.success('Location detected successfully');
        return result.location;
      } else {
        setLocationError(result.error);
        setLocationStatus('denied');
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get location';
      setLocationError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClockIn = async () => {
    // Validate that a shift is selected
    if (!selectedShift) {
      toast.error('Please select a shift to clock in');
      return;
    }

    // Validate that the shift belongs to the user
    if (selectedShift.assignedTo?._id !== user.id && selectedShift.assignedTo !== user.id) {
      toast.error('You can only clock in to your assigned shifts');
      return;
    }

    // No timing restrictions - users can clock in to their assigned shifts at any time

    if (!locationId) {
      toast.error('Please select a location first');
      return;
    }

    setIsLoading(true);

    try {
      // Get current location
      const location = await getCurrentLocation();
      
      if (!location) {
        toast.error('Location is required for clock-in');
        setIsLoading(false);
        return;
      }

      // Call API to clock in with selected shift
      const response = await timeTrackingApi.clockIn(locationId, selectedShift._id, location);
      
      if (response.success) {
        toast.success(`Clocked in successfully for ${selectedShift.description || 'your shift'}!`);
        if (onClockIn) onClockIn(response.data.timeEntry);
        // Reload shifts to update available shifts
        loadUserShifts();
      } else {
        toast.error(response.error?.message || 'Failed to clock in');
      }

    } catch (error) {
      console.error('Clock in error:', error);
      toast.error('Failed to clock in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentTimeEntry) {
      toast.error('No active clock-in found');
      return;
    }

    setIsLoading(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Call API to clock out
      const response = await timeTrackingApi.clockOut(
        currentTimeEntry._id, 
        location, 
        null // notes can be added later
      );
      
      if (response.success) {
        toast.success('Clocked out successfully!');
        if (onClockOut) onClockOut(response.data.timeEntry);
        // Reload shifts to update available shifts
        loadUserShifts();
      } else {
        toast.error(response.error?.message || 'Failed to clock out');
      }

    } catch (error) {
      console.error('Clock out error:', error);
      toast.error('Failed to clock out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationStatusBadge = () => {
    switch (locationStatus) {
      case 'granted':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Location Enabled
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Location Denied
          </Badge>
        );
      case 'prompt':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Location Permission Needed
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Location Not Supported
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrentLocation = () => {
    if (!currentLocation) return 'Location not detected';
    
    return geolocationService.formatCoordinates(
      currentLocation.latitude, 
      currentLocation.longitude
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold">Time Tracking</h3>
            </div>
            {getLocationStatusBadge()}
          </div>

          {/* Current Status */}
          {isClockedIn ? (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Currently Clocked In</p>
              {currentTimeEntry?.shiftId && (
                <p className="text-sm text-green-600 mt-1">
                  Shift: {currentTimeEntry.shiftId.description || 'Active Shift'}
                </p>
              )}
              <p className="text-xs text-green-600 mt-1">
                Since: {formatTime(currentTimeEntry?.clockInTime)}
              </p>
            </div>
          ) : (
            <>
              {/* Shift Selection */}
              {!isClockedIn && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Select Your Shift to Clock In:
                    </label>
                  </div>
                  
                  {loadingShifts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">Loading your shifts...</span>
                    </div>
                  ) : availableShifts.length > 0 ? (
                    <div className="space-y-2">
                      {availableShifts.map((shift) => {
                        const isSelected = selectedShift?._id === shift._id;
                        const canClockIn = true; // Users can clock in to any assigned shift
                        
                        return (
                          <div
                            key={shift._id}
                            onClick={() => canClockIn && setSelectedShift(shift)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : canClockIn 
                                  ? 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                  : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {shift.description || 'Shift'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {isToday(shift.startTime) ? 'Today' : 
                                   isTomorrow(shift.startTime) ? 'Tomorrow' : 
                                   formatDate(shift.startTime)} • {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {shift.locationId?.name || 'Location'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No shifts available for clock-in</p>
                      <p className="text-xs mt-1">Contact your supervisor to get assigned to shifts</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Location Status */}
          {locationStatus === 'denied' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Location access is required for time tracking. Please enable location in your browser settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isClockedIn ? (
              <Button 
                onClick={handleClockIn}
                disabled={isLoading || !selectedShift || isGettingLocation || locationStatus === 'denied'}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Clocking In...
                  </>
                ) : isGettingLocation ? (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Clock In to Selected Shift
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleClockOut}
                disabled={isLoading || isGettingLocation}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Clocking Out...
                  </>
                ) : isGettingLocation ? (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Clock Out
                  </>
                )}
              </Button>
            )}

            {/* Location Detection Button */}
            {locationStatus !== 'granted' && (
              <Button 
                onClick={getCurrentLocation}
                disabled={isGettingLocation || locationStatus === 'unsupported'}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 mr-2" />
                    Detect Location
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="text-center text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location: {formatCurrentLocation()}
            </div>
          )}

          {/* Error Display */}
          {locationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {locationError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClockInOutButton; 