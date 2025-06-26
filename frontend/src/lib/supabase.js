import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database table names
export const TABLES = {
  USERS: 'users',
  SHIFTS: 'shifts',
  SHIFT_BOOKINGS: 'shift_bookings',
  TIME_ENTRIES: 'time_entries',
  LOCATIONS: 'locations',
  PENALTIES: 'penalties'
}

// User roles
export const USER_ROLES = {
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// Shift statuses
export const SHIFT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Time entry statuses
export const TIME_ENTRY_STATUS = {
  CLOCKED_IN: 'clocked_in',
  CLOCKED_OUT: 'clocked_out',
  PENDING: 'pending'
} 