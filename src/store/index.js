import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_ROLES, SHIFT_STATUS, TIME_ENTRY_STATUS } from '../lib/utils'

// Export the new auth store
export { useAuthStore } from './authStore'

// Main application store
export const useStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // User management
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Shifts state
      shifts: [],
      userShifts: [],
      currentShift: null,

      // Time tracking state
      timeEntries: [],
      currentTimeEntry: null,
      isClocking: false,

      // Location state
      currentLocation: null,
      wifiNetwork: null,

      // Notifications
      notifications: [],

      // Actions
      setLoading: (isLoading) => set({ isLoading }),

      // Shift actions
      setShifts: (shifts) => set({ shifts }),
      setUserShifts: (userShifts) => set({ userShifts }),
      setCurrentShift: (currentShift) => set({ currentShift }),

      bookShift: (shiftId) => {
        const shifts = get().shifts
        const user = get().user
        
        const updatedShifts = shifts.map(shift => 
          shift.id === shiftId 
            ? { 
                ...shift, 
                status: SHIFT_STATUS.BOOKED,
                bookedBy: user.id,
                bookedAt: new Date().toISOString()
              }
            : shift
        )
        
        const userShifts = get().userShifts
        const bookedShift = updatedShifts.find(s => s.id === shiftId)
        
        set({ 
          shifts: updatedShifts,
          userShifts: [...userShifts, bookedShift]
        })
      },

      cancelShift: (shiftId) => {
        const shifts = get().shifts
        const userShifts = get().userShifts
        
        const updatedShifts = shifts.map(shift => 
          shift.id === shiftId 
            ? { 
                ...shift, 
                status: SHIFT_STATUS.CANCELLED,
                cancelledAt: new Date().toISOString()
              }
            : shift
        )
        
        const updatedUserShifts = userShifts.filter(shift => shift.id !== shiftId)
        
        set({ 
          shifts: updatedShifts,
          userShifts: updatedUserShifts
        })
      },

      // Time tracking actions
      setTimeEntries: (timeEntries) => set({ timeEntries }),
      setCurrentTimeEntry: (currentTimeEntry) => set({ currentTimeEntry }),
      setIsClocking: (isClocking) => set({ isClocking }),

      clockIn: async (shiftId, location, wifiNetwork) => {
        set({ isClocking: true })
        
        try {
          const timeEntry = {
            id: Date.now().toString(),
            shiftId,
            userId: get().user.id,
            clockInTime: new Date().toISOString(),
            clockInLocation: location,
            clockInWifi: wifiNetwork,
            status: TIME_ENTRY_STATUS.CLOCKED_IN
          }
          
          const timeEntries = get().timeEntries
          
          set({ 
            currentTimeEntry: timeEntry,
            timeEntries: [...timeEntries, timeEntry],
            currentShift: get().shifts.find(s => s.id === shiftId)
          })
          
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ isClocking: false })
        }
      },

      clockOut: async (location, wifiNetwork) => {
        set({ isClocking: true })
        
        try {
          const currentTimeEntry = get().currentTimeEntry
          if (!currentTimeEntry) {
            throw new Error('No active time entry found')
          }
          
          const updatedTimeEntry = {
            ...currentTimeEntry,
            clockOutTime: new Date().toISOString(),
            clockOutLocation: location,
            clockOutWifi: wifiNetwork,
            status: TIME_ENTRY_STATUS.CLOCKED_OUT
          }
          
          const timeEntries = get().timeEntries
          const updatedTimeEntries = timeEntries.map(entry => 
            entry.id === currentTimeEntry.id ? updatedTimeEntry : entry
          )
          
          set({ 
            currentTimeEntry: null,
            timeEntries: updatedTimeEntries,
            currentShift: null
          })
          
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ isClocking: false })
        }
      },

      // Location actions
      setCurrentLocation: (location) => set({ currentLocation: location }),
      setWifiNetwork: (network) => set({ wifiNetwork: network }),

      // Notification actions
      addNotification: (notification) => {
        const notifications = get().notifications
        set({ 
          notifications: [...notifications, { 
            id: Date.now().toString(), 
            ...notification,
            createdAt: new Date().toISOString()
          }] 
        })
      },

      removeNotification: (id) => {
        const notifications = get().notifications
        set({ notifications: notifications.filter(n => n.id !== id) })
      },

      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'suncoop-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userShifts: state.userShifts,
        timeEntries: state.timeEntries
      })
    }
  )
) 