import { 
  setCacheData, 
  getCacheData, 
  hasValidCache, 
  invalidateCache, 
  invalidateCacheByPattern 
} from '../hooks/useCache'
import api from './api'

// Cache durations for different types of data
const CACHE_DURATIONS = {
  WIFI_TRACKING: 1 * 60 * 1000, // 1 minute
  LOCATIONS: 10 * 60 * 1000,    // 10 minutes
  USERS: 5 * 60 * 1000          // 5 minutes
}

/**
 * Generic cached fetch function
 */
const cachedFetch = async (key, fetcher, duration = 5 * 60 * 1000, force = false) => {
  // Check cache first unless force refresh
  if (!force && hasValidCache(key)) {
    const cached = getCacheData(key)
    if (cached !== null) {
      return cached
    }
  }

  // Fetch fresh data
  try {
    const result = await fetcher()
    setCacheData(key, result, duration)
    return result
  } catch (error) {
    // If fetch fails and we have expired cache, return it
    const expired = getCacheData(key)
    if (expired !== null) {
      console.warn(`Using expired cache for ${key} due to fetch error:`, error)
      return expired
    }
    throw error
  }
}

/**
 * Cached WiFi Tracking API
 */
export const cachedWifiTrackingApi = {
  ...api.wifiTracking,

  getPendingExplanations: async (force = false) => {
    return cachedFetch(
      'wifi:pending-explanations',
      () => api.wifiTracking.getPendingExplanations(),
      CACHE_DURATIONS.WIFI_TRACKING,
      force
    )
  }
}

/**
 * Cached Locations API
 */
export const cachedLocationsApi = {
  ...api.locations,

  getLocations: async (params = {}, force = false) => {
    const key = `locations:list:${JSON.stringify(params)}`
    return cachedFetch(
      key,
      () => api.locations.getLocations(params),
      CACHE_DURATIONS.LOCATIONS,
      force
    )
  }
}

/**
 * Cached Users API
 */
export const cachedUsersApi = {
  ...api.users,

  getUsers: async (params = {}, force = false) => {
    const key = `users:list:${JSON.stringify(params)}`
    return cachedFetch(
      key,
      () => api.users.getUsers(params),
      CACHE_DURATIONS.USERS,
      force
    )
  },

  getPendingStaffApprovals: async (force = false) => {
    return cachedFetch(
      'users:pending-approvals',
      () => api.users.getPendingStaffApprovals(),
      CACHE_DURATIONS.USERS,
      force
    )
  },

  deleteUser: async (userId, confirmText) => {
    const result = await api.users.deleteUser(userId, confirmText)
    
    // Invalidate all user-related caches after deletion
    invalidateCacheByPattern('users:')
    
    return result
  },

  createUser: async (userData) => {
    const result = await api.users.createUser(userData)
    
    // Invalidate user caches after creation
    invalidateCacheByPattern('users:')
    
    return result
  },

  updateUser: async (id, userData) => {
    const result = await api.users.updateUser(id, userData)
    
    // Invalidate user caches after update
    invalidateCacheByPattern('users:')
    
    return result
  },

  deactivateUser: async (id) => {
    const result = await api.users.deactivateUser(id)
    
    // Invalidate user caches after deactivation
    invalidateCacheByPattern('users:')
    
    return result
  },

  reactivateUser: async (id) => {
    const result = await api.users.reactivateUser(id)
    
    // Invalidate user caches after reactivation
    invalidateCacheByPattern('users:')
    
    return result
  },

  approveStaff: async (userId) => {
    const result = await api.users.approveStaff(userId)
    
    // Invalidate user caches after approval
    invalidateCacheByPattern('users:')
    
    return result
  },

  rejectStaff: async (userId, reason) => {
    const result = await api.users.rejectStaff(userId, reason)
    
    // Invalidate user caches after rejection
    invalidateCacheByPattern('users:')
    
    return result
  }
}

export default {
  ...api,
  wifiTracking: cachedWifiTrackingApi,
  locations: cachedLocationsApi,
  users: cachedUsersApi
}
