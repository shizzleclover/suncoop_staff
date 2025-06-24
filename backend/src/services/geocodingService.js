/**
 * Geocoding Service
 * Handle GPS coordinate to address conversion using OpenCage API
 */

const axios = require('axios');
const logger = require('../utils/logger');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.OPENCAGE_API_KEY;
    this.baseUrl = 'https://api.opencagedata.com/geocode/v1/json';
    
    if (!this.apiKey) {
      logger.warn('OpenCage API key not found. Geocoding will be disabled.');
    }
  }

  /**
   * Convert latitude and longitude to human-readable address
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>} Address information
   */
  async reverseGeocode(latitude, longitude) {
    if (!this.apiKey) {
      logger.warn('OpenCage API key not configured. Skipping geocoding.');
      return {
        success: false,
        address: `${latitude}, ${longitude}`, // Fallback to coordinates
        formatted: `Lat: ${latitude}, Lng: ${longitude}`,
        components: {},
        error: 'API key not configured'
      };
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: `${latitude},${longitude}`,
          key: this.apiKey,
          limit: 1,
          no_annotations: 1,
          language: 'en'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        
        return {
          success: true,
          address: result.formatted,
          formatted: result.formatted,
          components: result.components || {},
          geometry: result.geometry,
          confidence: result.confidence,
          bounds: result.bounds
        };
      } else {
        logger.warn(`No geocoding results found for coordinates: ${latitude}, ${longitude}`);
        return {
          success: false,
          address: `${latitude}, ${longitude}`,
          formatted: `Lat: ${latitude}, Lng: ${longitude}`,
          components: {},
          error: 'No results found'
        };
      }

    } catch (error) {
      logger.error('Geocoding error:', error.message);
      
      // Return fallback response on error
      return {
        success: false,
        address: `${latitude}, ${longitude}`,
        formatted: `Lat: ${latitude}, Lng: ${longitude}`,
        components: {},
        error: error.message
      };
    }
  }

  /**
   * Batch geocode multiple coordinates
   * @param {Array} coordinates Array of {lat, lng} objects
   * @returns {Promise<Array>} Array of address results
   */
  async batchReverseGeocode(coordinates) {
    const results = [];
    
    // Process in small batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize);
      const batchPromises = batch.map(coord => 
        this.reverseGeocode(coord.latitude, coord.longitude)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : {
          success: false,
          address: 'Error occurred',
          error: result.reason?.message || 'Unknown error'
        }
      ));
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < coordinates.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }

  /**
   * Get a short, readable location name from coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<string>} Short location name
   */
  async getLocationName(latitude, longitude) {
    const result = await this.reverseGeocode(latitude, longitude);
    
    if (result.success && result.components) {
      const components = result.components;
      
      // Try to build a short, meaningful name
      const building = components.building || components.house_number;
      const road = components.road || components.street;
      const neighborhood = components.neighbourhood || components.suburb;
      const city = components.city || components.town || components.village;
      const state = components.state || components.province;
      
      // Build location name with available components
      const parts = [];
      
      if (building && road) {
        parts.push(`${building} ${road}`);
      } else if (road) {
        parts.push(road);
      } else if (neighborhood) {
        parts.push(neighborhood);
      }
      
      if (city && city !== neighborhood) {
        parts.push(city);
      }
      
      if (state && parts.length < 2) {
        parts.push(state);
      }
      
      return parts.length > 0 ? parts.join(', ') : result.address;
    }
    
    return result.address;
  }

  /**
   * Validate if coordinates are reasonable
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {boolean} Whether coordinates are valid
   */
  validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }
}

// Export singleton instance
module.exports = new GeocodingService(); 