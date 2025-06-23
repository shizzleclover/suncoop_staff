import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_ROLES } from '../lib/utils'
import { authApi, ApiError } from '../lib/api'

// System settings
const SYSTEM_SETTINGS = {
  isSystemInitialized: true, // Will be checked via API
  organizationName: 'SunCoop Management',
  organizationType: 'Staff Management',
  systemVersion: '1.0.0',
  lastUpdated: new Date().toISOString()
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      systemSettings: SYSTEM_SETTINGS,
      sessionToken: null,
      loginTimestamp: null,
      systemStatus: null, // Will store the system status from API

      // Check if system needs initial setup
      needsInitialSetup: () => {
        const state = get();
        return state.systemStatus?.needsInitialSetup || false;
      },

      // Check system status with backend
      checkSystemStatus: async () => {
        try {
          const response = await authApi.getSystemStatus();
          const systemStatus = response.data;
          
          set({ systemStatus });
          return systemStatus;
        } catch (error) {
          console.error('Failed to check system status:', error);
          
          // Always throw error to ensure proper backend connection
          throw new Error('Unable to connect to the backend server. Please check your connection and try again.');
        }
      },

      // Initialize authentication state on app load
      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // First check system status
          await get().checkSystemStatus();
          
          const token = localStorage.getItem('authToken');
          if (!token) {
            set({ isLoading: false });
            return;
          }

          // No mock token handling

          // Verify token with server
          const response = await authApi.getCurrentUser();
          const user = response.data.user;

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            sessionToken: token,
            loginTimestamp: localStorage.getItem('loginTimestamp') || new Date().toISOString()
          });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTimestamp');
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            sessionToken: null,
            loginTimestamp: null
          });
        }
      },

      // Initial admin setup (first-time setup)
      setupInitialAdmin: async (setupData) => {
        set({ isLoading: true });
        
        try {
          // Validate setup data
          if (!setupData.username || !setupData.email || !setupData.password) {
            throw new Error('Username, email, and password are required');
          }

          if (setupData.password !== setupData.confirmPassword) {
            throw new Error('Passwords do not match');
          }

          const response = await authApi.register(setupData);
          const { user, token } = response.data;

          // Store token
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
          const loginTimestamp = new Date().toISOString();
          localStorage.setItem('loginTimestamp', loginTimestamp);

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            sessionToken: token,
            loginTimestamp
          });

          // Update system status after successful admin setup
          await get().checkSystemStatus();

          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof ApiError ? error.message : 'Registration failed'
          };
        }
      },

      // Regular login
      signIn: async (identifier, password) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.login({ identifier, password });
          const { user, token } = response.data;

          // Store token and user data
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
          const loginTimestamp = new Date().toISOString();
          localStorage.setItem('loginTimestamp', loginTimestamp);

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            sessionToken: token,
            loginTimestamp
          });

          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof ApiError ? error.message : 'Login failed'
          };
        }
      },

      signOut: async () => {
        const state = get();
        
        try {
          // Call logout endpoint to invalidate token on server
          if (state.sessionToken) {
            await authApi.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with local logout even if server call fails
        } finally {
          // Clear local storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTimestamp');
          
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            sessionToken: null,
            loginTimestamp: null
          });
        }
      },

      // Password reset request
      requestPasswordReset: async (email) => {
        set({ isLoading: true });
        
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof ApiError ? error.message : 'Failed to send reset email'
          };
        }
      },

      // Password reset
      resetPassword: async (token, password, confirmPassword) => {
        set({ isLoading: true });
        
        try {
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
          }

          await authApi.resetPassword(token, password, confirmPassword);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof ApiError ? error.message : 'Password reset failed'
          };
        }
      },

      // Validate current session
      validateSession: () => {
        const state = get();
        if (!state.sessionToken || !state.isAuthenticated) {
          return false;
        }

        // Check if session is still valid (basic check)
        const loginTime = new Date(state.loginTimestamp || 0);
        const now = new Date();
        const diffHours = (now - loginTime) / (1000 * 60 * 60);
        
        // Session expires after 24 hours
        if (diffHours > 24) {
          state.signOut();
          return false;
        }

        return true;
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        
        try {
          // This would call a user update API endpoint
          // For now, just update local state
          const currentUser = get().user;
          const updatedUser = { ...currentUser, ...profileData };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          set({ 
            user: updatedUser,
            isLoading: false
          });

          return { success: true, user: updatedUser };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: 'Profile update failed'
          };
        }
      },

      // Check user permissions
      hasPermission: (permission) => {
        const user = get().user;
        if (!user || !user.isActive) return false;
        
        // Admin has all permissions
        if (user.role === USER_ROLES.ADMIN) return true;
        
        // Add specific permission checks here
        switch (permission) {
          case 'view_dashboard':
            return user.role === USER_ROLES.STAFF || user.role === USER_ROLES.ADMIN;
          case 'manage_users':
          case 'manage_shifts':
          case 'manage_locations':
          case 'view_reports':
            return user.role === USER_ROLES.ADMIN;
          case 'view_own_shifts':
          case 'book_shifts':
          case 'clock_in_out':
            return user.role === USER_ROLES.STAFF || user.role === USER_ROLES.ADMIN;
          default:
            return false;
        }
      },

      // Get user role
      getUserRole: () => {
        const user = get().user;
        return user ? user.role : null;
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        return user && user.role === USER_ROLES.ADMIN;
      },

      // Check if user is staff
      isStaff: () => {
        const user = get().user;
        return user && user.role === USER_ROLES.STAFF;
      }
    }),
    {
      name: 'suncoop-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
        loginTimestamp: state.loginTimestamp,
        systemSettings: state.systemSettings
      })
    }
  )
) 