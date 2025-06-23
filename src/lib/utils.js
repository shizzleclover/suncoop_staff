import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
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
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Time entry statuses
export const TIME_ENTRY_STATUS = {
  CLOCKED_IN: 'clocked_in',
  CLOCKED_OUT: 'clocked_out',
  BREAK_START: 'break_start',
  BREAK_END: 'break_end'
}

// Business rules
export const BUSINESS_RULES = {
  MAX_DAILY_HOURS: 3,
  MAX_MONTHLY_HOURS: 50,
  MAX_MONTHLY_CANCELLATIONS: 4,
  MIN_SHIFT_DURATION: 1, // hours
  MAX_SHIFT_DURATION: 2, // hours
  WORK_START_HOUR: 8,
  WORK_END_HOUR: 22,
  CANCELLATION_NOTICE_HOURS: 24,
  LATE_PENALTY_MINUTES: 15,
  PENALTY_HOURS_PER_CANCELLATION: 1,
  PENALTY_HOURS_NO_SHOW: 2
}

// Utility functions
export const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export const formatDateShort = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

export const calculateHoursBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.abs(end - start) / (1000 * 60 * 60)
}

// Alias for calculateHoursBetween - used in time tracking
export const calculateHours = (startTime, endTime) => {
  return calculateHoursBetween(startTime, endTime)
}

// Earnings calculation removed - hours-based system only

export const isWithinTimeRange = (time, startHour, endHour) => {
  const hour = new Date(time).getHours()
  return hour >= startHour && hour <= endHour
}

export const isShiftOverlapping = (shift1, shift2) => {
  const start1 = new Date(shift1.startTime)
  const end1 = new Date(shift1.endTime)
  const start2 = new Date(shift2.startTime)
  const end2 = new Date(shift2.endTime)
  
  return start1 < end2 && start2 < end1
}

export const getDayOfWeek = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })
}

export const isToday = (dateString) => {
  const today = new Date().toDateString()
  const date = new Date(dateString).toDateString()
  return today === date
}

export const isTomorrow = (dateString) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = new Date(dateString).toDateString()
  return tomorrow.toDateString() === date
}

export const getTimeUntilShift = (shiftStartTime) => {
  const now = new Date()
  const start = new Date(shiftStartTime)
  const diffMs = start - now
  
  if (diffMs <= 0) return 'Started'
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  } else {
    return `${diffMinutes}m`
  }
}

export const canCancelShift = (shiftStartTime) => {
  const now = new Date()
  const start = new Date(shiftStartTime)
  const hoursUntilShift = (start - now) / (1000 * 60 * 60)
  
  return hoursUntilShift >= BUSINESS_RULES.CANCELLATION_NOTICE_HOURS
}

export const isLateClockIn = (shiftStartTime, clockInTime) => {
  const start = new Date(shiftStartTime)
  const clockIn = new Date(clockInTime)
  const diffMinutes = (clockIn - start) / (1000 * 60)
  
  return diffMinutes > BUSINESS_RULES.LATE_PENALTY_MINUTES
}


