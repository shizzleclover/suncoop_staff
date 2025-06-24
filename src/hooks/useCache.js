import { useState, useRef, useCallback } from 'react'

// Cache storage
const cache = new Map()
const cacheTimestamps = new Map()
const cacheExpirations = new Map()

// Default cache duration (5 minutes)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000

/**
 * Custom hook for caching API data
 * @param {string} key - Unique cache key
 * @param {Function} fetcher - Function to fetch data
 * @param {Object} options - Cache options
 * @returns {Object} - Data, loading state, error, and refresh function
 */
export const useCache = (key, fetcher, options = {}) => {
  const {
    duration = DEFAULT_CACHE_DURATION,
    enabled = true,
    staleTime = 0,
    refetchOnMount = true,
    refetchOnWindowFocus = false
  } = options

  const [data, setData] = useState(() => {
    if (!enabled || !key) return null
    return getCacheData(key)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  const abortControllerRef = useRef(null)

  // Update fetcher ref when it changes
  fetcherRef.current = fetcher

  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !key) return

    // Check if we have valid cached data
    if (!force && hasValidCache(key, staleTime)) {
      const cachedData = getCacheData(key)
      if (cachedData !== null) {
        setData(cachedData)
        return cachedData
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const result = await fetcherRef.current({ signal: abortControllerRef.current.signal })
      
      // Cache the result
      setCacheData(key, result, duration)
      setData(result)
      
      return result
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err)
        console.error(`Cache fetch error for key "${key}":`, err)
      }
      throw err
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [key, enabled, duration, staleTime])

  // Initial fetch or when key changes
  const initialFetchRef = useRef(false)
  if (enabled && key && !initialFetchRef.current && refetchOnMount) {
    initialFetchRef.current = true
    fetchData().catch(() => {}) // Catch to prevent unhandled promise rejection
  }

  // Refresh function for manual refetch
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Invalidate cache
  const invalidate = useCallback(() => {
    if (key) {
      invalidateCache(key)
    }
  }, [key])

  // Cleanup on unmount
  const cleanupRef = useRef(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  })

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale: key ? isCacheStale(key, staleTime) : false,
    isCached: key ? hasCache(key) : false
  }
}

/**
 * Cache utility functions
 */

// Set cache data with expiration
export const setCacheData = (key, data, duration = DEFAULT_CACHE_DURATION) => {
  const now = Date.now()
  cache.set(key, data)
  cacheTimestamps.set(key, now)
  cacheExpirations.set(key, now + duration)
}

// Get cache data
export const getCacheData = (key) => {
  if (!hasValidCache(key)) {
    return null
  }
  return cache.get(key) || null
}

// Check if cache exists
export const hasCache = (key) => {
  return cache.has(key)
}

// Check if cache is valid (not expired)
export const hasValidCache = (key, staleTime = 0) => {
  if (!hasCache(key)) return false
  
  const expiration = cacheExpirations.get(key)
  const now = Date.now()
  
  return expiration && now < expiration
}

// Check if cache is stale
export const isCacheStale = (key, staleTime = 0) => {
  if (!hasCache(key)) return true
  
  const timestamp = cacheTimestamps.get(key)
  const now = Date.now()
  
  return !timestamp || (now - timestamp) > staleTime
}

// Invalidate specific cache entry
export const invalidateCache = (key) => {
  cache.delete(key)
  cacheTimestamps.delete(key)
  cacheExpirations.delete(key)
}

// Invalidate cache by pattern
export const invalidateCacheByPattern = (pattern) => {
  const regex = new RegExp(pattern)
  const keysToDelete = []
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => invalidateCache(key))
}

// Clear all cache
export const clearAllCache = () => {
  cache.clear()
  cacheTimestamps.clear()
  cacheExpirations.clear()
}

// Cleanup expired cache entries
export const cleanupExpiredCache = () => {
  const now = Date.now()
  const expiredKeys = []
  
  for (const [key, expiration] of cacheExpirations.entries()) {
    if (now >= expiration) {
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => invalidateCache(key))
  
  return expiredKeys.length
}

// Get cache statistics
export const getCacheStats = () => {
  const now = Date.now()
  let expired = 0
  let valid = 0
  
  for (const [key, expiration] of cacheExpirations.entries()) {
    if (now >= expiration) {
      expired++
    } else {
      valid++
    }
  }
  
  return {
    total: cache.size,
    valid,
    expired,
    memoryUsage: JSON.stringify([...cache.entries()]).length
  }
}

// Auto cleanup interval (runs every 5 minutes)
let cleanupInterval = null

export const startAutoCleanup = (interval = 5 * 60 * 1000) => {
  if (cleanupInterval) return
  
  cleanupInterval = setInterval(() => {
    const cleaned = cleanupExpiredCache()
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`)
    }
  }, interval)
}

export const stopAutoCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

// Start auto cleanup by default
if (typeof window !== 'undefined') {
  startAutoCleanup()
} 