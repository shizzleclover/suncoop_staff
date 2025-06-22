import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_ROLES } from '../lib/utils'

// Demo users for authentication
const DEMO_USERS = [
  {
    id: '1',
    email: 'staff@suncoop.com',
    firstName: 'John',
    lastName: 'Doe',
    role: USER_ROLES.STAFF,
    phone: '+1-555-0123',
    address: '123 Main St, City, State'
  },
  {
    id: '2', 
    email: 'admin@suncoop.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: USER_ROLES.ADMIN,
    phone: '+1-555-0124',
    address: '456 Admin Ave, City, State'
  }
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: (email, password) => {
        set({ isLoading: true })
        
        // Find user by email (case-insensitive)
        const user = DEMO_USERS.find(u => 
          u.email.toLowerCase() === email.toLowerCase()
        )
        
        if (user) {
          // For demo purposes, accept any password
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return true
        }
        
        set({ isLoading: false })
        return false
      },

      signOut: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
      },

      updateProfile: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })
          return true
        }
        return false
      },

      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'suncoop-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 