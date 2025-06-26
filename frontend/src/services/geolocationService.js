/**
 * Geolocation Service
 * Handle GPS location detection for clock-in/out functionality
 */

class GeolocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute cache
    };
  }

  /**
   * Check if geolocation is supported
   * @returns {boolean}
   */
  isGeolocationSupported() {
    return this.isSupported;
  }

  /**
   * Get current position with Promise-based API
   * @returns {Promise<Object>} Position object with coordinates
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Location error: ${error.message}`;
              break;
          }
          
          reject(new Error(errorMessage));
        },
        this.options
      );
    });
  }

  /**
   * Watch position changes (for real-time tracking)
   * @param {Function} onSuccess Callback for successful position updates
   * @param {Function} onError Callback for errors
   * @returns {number} Watch ID for clearing the watch
   */
  watchPosition(onSuccess, onError) {
    if (!this.isSupported) {
      onError(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        });
      },
      (error) => {
        let errorMessage = 'Unable to track your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = error.message;
            break;
        }
        
        onError(new Error(errorMessage));
      },
      this.options
    );
  }

  /**
   * Clear position watch
   * @param {number} watchId Watch ID returned by watchPosition
   */
  clearWatch(watchId) {
    if (watchId && this.isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Check location permissions status
   * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'prompt'
   */
  async checkPermissions() {
    if (!navigator.permissions) {
      return 'unknown';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.warn('Could not check geolocation permissions:', error);
      return 'unknown';
    }
  }

  /**
   * Request location with user-friendly error handling
   * @returns {Promise<Object>} Location object with user-friendly error messages
   */
  async requestLocation() {
    try {
      // Check permissions first
      const permission = await this.checkPermissions();
      
      if (permission === 'denied') {
        throw new Error('Location access has been denied. Please enable location permissions in your browser settings and refresh the page.');
      }

      // Get current position
      const position = await this.getCurrentPosition();
      
      return {
        success: true,
        location: position,
        message: 'Location detected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        location: null,
        message: error.message
      };
    }
  }

  /**
   * Calculate distance between two coordinates (in meters)
   * @param {number} lat1 First latitude
   * @param {number} lon1 First longitude
   * @param {number} lat2 Second latitude
   * @param {number} lon2 Second longitude
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if user is within a certain radius of a location
   * @param {Object} userLocation User's current location
   * @param {Object} targetLocation Target location to check against
   * @param {number} radiusMeters Allowed radius in meters
   * @returns {boolean} Whether user is within the radius
   */
  isWithinRadius(userLocation, targetLocation, radiusMeters = 100) {
    if (!userLocation || !targetLocation) {
      return false;
    }

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    return distance <= radiusMeters;
  }

  /**
   * Format coordinates for display
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {string} Formatted coordinates
   */
  formatCoordinates(latitude, longitude) {
    if (!latitude || !longitude) {
      return 'Location unavailable';
    }

    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lonDir}`;
  }
}

// Export singleton instance
export default new GeolocationService(); 