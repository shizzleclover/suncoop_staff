/**
 * API Service Layer
 * Centralized API communication for SunCoop Staff Management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Exponential backoff helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
    console.log('API Response data:', data);
  } catch (error) {
    console.error('Error parsing response JSON:', error);
    throw new ApiError('Invalid JSON response', response.status, null);
  }
  
  if (!response.ok) {
    // If token is invalid, clear it and redirect to login
    if (response.status === 401 && data.error?.message?.includes('token')) {
      console.log('Auth token invalid, redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new ApiError(
      data.error?.message || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data;
};

// Generic API request function with retry logic
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  console.log(`API Request to: ${url}`, { method: options.method || 'GET', attempt: retryCount + 1 });
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  // Don't stringify FormData
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    console.log('Fetch config:', { ...config, headers: { ...config.headers } });
    const response = await fetch(url, config);
    console.log(`API Response status: ${response.status}`);
    
    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < 3) {
      const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retryCount);
      const delayMs = parseInt(retryAfter) * 1000;
      
      console.log(`Rate limited. Retrying after ${delayMs}ms (attempt ${retryCount + 1}/3)`);
      
      await delay(delayMs);
      return apiRequest(endpoint, options, retryCount + 1);
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0, null);
  }
};

// Auth API
export const authApi = {
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },
  
  staffRegister: async (userData) => {
    return await apiRequest('/auth/staff-register', {
      method: 'POST',
      body: userData,
    });
  },
  
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },
  
  forgotPassword: async (email) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },
  
  resetPassword: async (token, password, confirmPassword) => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password, confirmPassword },
    });
  },

  getSystemStatus: async () => {
    // This is a public endpoint, so no auth token needed
    const url = `${API_BASE_URL}/auth/system-status`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  },
};

// Users API
export const usersApi = {
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/users?${queryString}`);
  },
  
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/users?${queryString}`);
  },
  
  getUserById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },
  
  getProfile: async () => {
    return await apiRequest('/users/profile');
  },
  
  createUser: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: userData,
    });
  },
  
  updateUser: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  },
  
  deactivateUser: async (id) => {
    return await apiRequest(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  },
  
  reactivateUser: async (id) => {
    return await apiRequest(`/users/${id}/reactivate`, {
      method: 'POST',
    });
  },
  
  updateUserStatus: async (id, isActive) => {
    return await apiRequest(`/users/${id}/status`, {
      method: 'PUT',
      body: { isActive },
    });
  },
  
  getUserStats: async () => {
    return await apiRequest('/users/stats');
  },
  
  getPendingStaffApprovals: async () => {
    return await apiRequest('/users/pending-approvals');
  },
  
  approveStaff: async (userId) => {
    return await apiRequest(`/users/${userId}/approve`, {
      method: 'POST',
    });
  },
  
  rejectStaff: async (userId, reason) => {
    return await apiRequest(`/users/${userId}/reject`, {
      method: 'POST',
      body: { reason },
    });
  },

  updateUser: async (userId, userData) => {
    return await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: userData,
    });
  },

  deleteUser: async (userId) => {
    return await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Shifts API
export const shiftsApi = {
  getShifts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/shifts?${queryString}`);
  },
  
  getAvailableShifts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/shifts/available?${queryString}`);
  },
  
  getUserShifts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/shifts/my-shifts?${queryString}`);
  },
  
  getShiftById: async (id) => {
    return await apiRequest(`/shifts/${id}`);
  },
  
  createShift: async (shiftData) => {
    return await apiRequest('/shifts', {
      method: 'POST',
      body: shiftData,
    });
  },
  
  updateShift: async (id, shiftData) => {
    return await apiRequest(`/shifts/${id}`, {
      method: 'PUT',
      body: shiftData,
    });
  },
  
  assignShift: async (id, userId = null) => {
    return await apiRequest(`/shifts/${id}/assign`, {
      method: 'POST',
      body: userId ? { userId } : {},
    });
  },
  
  unassignShift: async (id) => {
    return await apiRequest(`/shifts/${id}/unassign`, {
      method: 'POST',
    });
  },
  
  deleteShift: async (id) => {
    return await apiRequest(`/shifts/${id}`, {
      method: 'DELETE',
    });
  },
  
  clearAllShifts: async (confirmText) => {
    return await apiRequest('/shifts/clear-all', {
      method: 'DELETE',
      body: { confirmText },
    });
  },
};

// Locations API
export const locationsApi = {
  getLocations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/locations?${queryString}`);
  },
  
  getActiveLocations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/locations/active?${queryString}`);
  },
  
  getNearbyLocations: async (lat, lng, radius = 1000) => {
    return await apiRequest(`/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },
  
  getLocationById: async (id) => {
    return await apiRequest(`/locations/${id}`);
  },
  
  getLocationShifts: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/locations/${id}/shifts?${queryString}`);
  },
  
  getLocationStats: async (id) => {
    return await apiRequest(`/locations/${id}/stats`);
  },
  
  createLocation: async (locationData) => {
    return await apiRequest('/locations', {
      method: 'POST',
      body: locationData,
    });
  },
  
  updateLocation: async (id, locationData) => {
    return await apiRequest(`/locations/${id}`, {
      method: 'PUT',
      body: locationData,
    });
  },
  
  deactivateLocation: async (id) => {
    return await apiRequest(`/locations/${id}/deactivate`, {
      method: 'POST',
    });
  },
  
  activateLocation: async (id) => {
    return await apiRequest(`/locations/${id}/activate`, {
      method: 'POST',
    });
  },
};

// Time Tracking API
export const timeTrackingApi = {
  getTimeEntries: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/time-entries?${queryString}`);
  },
  
  getMyTimeEntries: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/time-entries/my-entries?${queryString}`);
  },
  
  getTimeEntryById: async (id) => {
    return await apiRequest(`/time-entries/${id}`);
  },
  
  createTimeEntry: async (timeEntryData) => {
    return await apiRequest('/time-entries', {
      method: 'POST',
      body: timeEntryData,
    });
  },
  
  clockIn: async (locationId, shiftId = null, location = null) => {
    return await apiRequest('/time-entries/clock-in', {
      method: 'POST',
      body: { locationId, shiftId, location },
    });
  },
  
  clockOut: async (timeEntryId = null, location = null, notes = null) => {
    return await apiRequest('/time-entries/clock-out', {
      method: 'POST',
      body: { timeEntryId, location, notes },
    });
  },
  
  updateTimeEntry: async (id, timeEntryData) => {
    return await apiRequest(`/time-entries/${id}`, {
      method: 'PUT',
      body: timeEntryData,
    });
  },
  
  approveTimeEntry: async (id, adminNotes = null) => {
    return await apiRequest(`/time-entries/${id}/approve`, {
      method: 'POST',
      body: { adminNotes },
    });
  },
  
  rejectTimeEntry: async (id, reason) => {
    return await apiRequest(`/time-entries/${id}/reject`, {
      method: 'POST',
      body: { reason },
    });
  },
  
  getPendingApprovals: async () => {
    return await apiRequest('/time-entries/pending');
  },
  
  getCurrentlyWorking: async () => {
    return await apiRequest('/time-entries/currently-working');
  },
  
  getTimeSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/time-entries/summary?${queryString}`);
  },
};

// Notifications API
export const notificationsApi = {
  getUserNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/notifications?${queryString}`);
  },
  
  getAllNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/notifications/all?${queryString}`);
  },
  
  getUnreadCount: async () => {
    return await apiRequest('/notifications/unread');
  },
  
  getNotificationById: async (id) => {
    return await apiRequest(`/notifications/${id}`);
  },
  
  createNotification: async (notificationData) => {
    return await apiRequest('/notifications', {
      method: 'POST',
      body: notificationData,
    });
  },
  
  broadcastNotification: async (notificationData) => {
    return await apiRequest('/notifications/broadcast', {
      method: 'POST',
      body: notificationData,
    });
  },
  
  markAsRead: async (id) => {
    return await apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
  
  markAllAsRead: async () => {
    return await apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },
  
  deleteNotification: async (id) => {
    return await apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
  
  cleanupNotifications: async () => {
    return await apiRequest('/notifications/cleanup', {
      method: 'DELETE',
    });
  },
};

// Reports API (if you have reports endpoints)
export const reportsApi = {
  getDashboardStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/reports/dashboard?${queryString}`);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return await apiRequest('/health');
  },
};



// Export the ApiError class for use in components
export { ApiError };

// Default export with all APIs
export default {
  auth: authApi,
  users: usersApi,
  shifts: shiftsApi,
  locations: locationsApi,
  timeTracking: timeTrackingApi,
  notifications: notificationsApi,
  reports: reportsApi,
  health: healthApi,
}; 