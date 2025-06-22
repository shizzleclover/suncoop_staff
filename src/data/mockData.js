import { USER_ROLES, SHIFT_STATUS, TIME_ENTRY_STATUS } from '../lib/utils'

// Mock users
export const mockUsers = [
  {
    id: 'user-1',
    username: 'admin',
    displayName: 'System Administrator',
    email: 'admin@suncoop.com',
    role: 'admin',
    avatar: null,
    isActive: true,
    joinDate: '2024-01-01',
    phone: '+1 (555) 123-4567',
    bio: 'System administrator with full access to all management functions.',
    department: 'Management',
    employeeId: 'EMP001'
  },
  {
    id: 'user-2',
    username: 'sarah.chen',
    displayName: 'Sarah Chen',
    email: 'sarah.chen@suncoop.com',
    role: 'staff',
    avatar: null,
    isActive: true,
    joinDate: '2024-01-15',
    phone: '+1 (555) 234-5678',
    bio: 'Experienced team member specializing in customer service and operations.',
    department: 'Operations',
    employeeId: 'EMP002'
  },
  {
    id: 'user-3',
    username: 'mike.johnson',
    displayName: 'Mike Johnson',
    email: 'mike.johnson@suncoop.com',
    role: 'staff',
    avatar: null,
    isActive: true,
    joinDate: '2024-02-01',
    phone: '+1 (555) 345-6789',
    bio: 'Reliable team player with strong attention to detail.',
    department: 'Operations',
    employeeId: 'EMP003'
  },
  {
    id: 'user-4',
    username: 'emma.wilson',
    displayName: 'Emma Wilson',
    email: 'emma.wilson@suncoop.com',
    role: 'staff',
    avatar: null,
    isActive: true,
    joinDate: '2024-02-15',
    phone: '+1 (555) 456-7890',
    bio: 'New team member eager to contribute and learn.',
    department: 'Operations',
    employeeId: 'EMP004'
  },
  {
    id: 'user-5',
    username: 'alex.thompson',
    displayName: 'Alex Thompson',
    email: 'alex.thompson@suncoop.com',
    role: 'staff',
    avatar: null,
    isActive: true,
    joinDate: '2024-01-20',
    phone: '+1 (555) 567-8901',
    bio: 'Experienced professional with leadership capabilities.',
    department: 'Operations',
    employeeId: 'EMP005'
  }
]

// Mock locations
export const mockLocations = [
  {
    id: 'loc-1',
    name: 'Downtown Office',
    address: '123 Main Street, Downtown',
    city: 'Metro City',
    type: 'Office',
    capacity: 50,
    isActive: true,
    manager: 'user-1',
    contactPhone: '+1 (555) 111-2222'
  },
  {
    id: 'loc-2',
    name: 'Westside Branch',
    address: '456 Oak Avenue, Westside',
    city: 'Metro City',
    type: 'Branch',
    capacity: 30,
    isActive: true,
    manager: 'user-1',
    contactPhone: '+1 (555) 333-4444'
  },
  {
    id: 'loc-3',
    name: 'Shopping Mall Kiosk',
    address: '789 Commerce Way, Mall Level 2',
    city: 'Metro City',
    type: 'Retail',
    capacity: 10,
    isActive: true,
    manager: 'user-1',
    contactPhone: '+1 (555) 555-6666'
  },
  {
    id: 'loc-4',
    name: 'Corporate Headquarters',
    address: '321 Business Plaza, Suite 1000',
    city: 'Metro City',
    type: 'Corporate',
    capacity: 100,
    isActive: true,
    manager: 'user-1',
    contactPhone: '+1 (555) 777-8888'
  }
]

// Helper function to generate shifts
const generateShifts = () => {
  const shifts = []
  const today = new Date()
  
  // Generate shifts for the past week, current week, and next two weeks
  for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
    const shiftDate = new Date(today)
    shiftDate.setDate(shiftDate.getDate() + dayOffset)
    
    // Skip weekends for some locations
    const isWeekend = shiftDate.getDay() === 0 || shiftDate.getDay() === 6
    
    mockLocations.forEach((location, locIndex) => {
      // Skip weekend shifts for office locations
      if (isWeekend && location.type === 'Office') return
      
      // Morning shift (9 AM - 1 PM)
      const morningStart = new Date(shiftDate)
      morningStart.setHours(9, 0, 0, 0)
      const morningEnd = new Date(shiftDate)
      morningEnd.setHours(13, 0, 0, 0)
      
      // Afternoon shift (1 PM - 6 PM)
      const afternoonStart = new Date(shiftDate)
      afternoonStart.setHours(13, 0, 0, 0)
      const afternoonEnd = new Date(shiftDate)
      afternoonEnd.setHours(18, 0, 0, 0)
      
      // Evening shift (6 PM - 10 PM) - only for retail locations
      const eveningStart = new Date(shiftDate)
      eveningStart.setHours(18, 0, 0, 0)
      const eveningEnd = new Date(shiftDate)
      eveningEnd.setHours(22, 0, 0, 0)
      
      // Determine shift assignment and status
      const isPastShift = morningStart < today
      let morningAssignment = null
      let afternoonAssignment = null
      let eveningAssignment = null
      
      // Assign shifts based on patterns
      if (isPastShift) {
        // Past shifts - most are completed
        morningAssignment = mockUsers.filter(u => u.role === 'staff')[dayOffset % 4]?.id || null
        afternoonAssignment = mockUsers.filter(u => u.role === 'staff')[(dayOffset + 1) % 4]?.id || null
        if (location.type === 'Retail') {
          eveningAssignment = mockUsers.filter(u => u.role === 'staff')[(dayOffset + 2) % 4]?.id || null
        }
      } else if (dayOffset >= 0 && dayOffset <= 3) {
        // Current and next few days - some shifts are booked
        if (Math.random() > 0.4) { // 60% chance of being booked
          morningAssignment = mockUsers.filter(u => u.role === 'staff')[Math.floor(Math.random() * 4)]?.id || null
        }
        if (Math.random() > 0.5) { // 50% chance of being booked
          afternoonAssignment = mockUsers.filter(u => u.role === 'staff')[Math.floor(Math.random() * 4)]?.id || null
        }
        if (location.type === 'Retail' && Math.random() > 0.6) { // 40% chance of being booked
          eveningAssignment = mockUsers.filter(u => u.role === 'staff')[Math.floor(Math.random() * 4)]?.id || null
        }
      }
      // Future shifts beyond 3 days remain unassigned (available)
      
      // Morning shift
      shifts.push({
        id: `shift-${shifts.length + 1}`,
        locationId: location.id,
        startTime: morningStart.toISOString(),
        endTime: morningEnd.toISOString(),
        assignedTo: morningAssignment,
        status: morningAssignment ? 'BOOKED' : 'AVAILABLE',
        description: 'Morning operations and customer service',
        requirements: ['Customer Service', 'Cash Handling'],
        maxCapacity: 2,
        currentCapacity: morningAssignment ? 1 : 0,
        createdAt: new Date(shiftDate.getTime() - 24 * 60 * 60 * 1000).toISOString() // Created day before
      })
      
      // Afternoon shift
      shifts.push({
        id: `shift-${shifts.length + 1}`,
        locationId: location.id,
        startTime: afternoonStart.toISOString(),
        endTime: afternoonEnd.toISOString(),
        assignedTo: afternoonAssignment,
        status: afternoonAssignment ? 'BOOKED' : 'AVAILABLE',
        description: 'Afternoon operations and inventory management',
        requirements: ['Inventory Management', 'Customer Service'],
        maxCapacity: 2,
        currentCapacity: afternoonAssignment ? 1 : 0,
        createdAt: new Date(shiftDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
      })
      
      // Evening shift (retail only)
      if (location.type === 'Retail') {
        shifts.push({
          id: `shift-${shifts.length + 1}`,
          locationId: location.id,
          startTime: eveningStart.toISOString(),
          endTime: eveningEnd.toISOString(),
          assignedTo: eveningAssignment,
          status: eveningAssignment ? 'BOOKED' : 'AVAILABLE',
          description: 'Evening retail operations and closing procedures',
          requirements: ['Retail Experience', 'Closing Procedures'],
          maxCapacity: 1,
          currentCapacity: eveningAssignment ? 1 : 0,
          createdAt: new Date(shiftDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
        })
      }
    })
  }
  
  return shifts
}

export const mockShifts = generateShifts()

// Mock time entries
export const mockTimeEntries = [
  // Sarah Chen's entries
  {
    id: 'entry-1',
    userId: 'user-2',
    locationId: 'loc-1',
    date: '2024-12-16',
    hoursWorked: 8.0,
    status: 'approved',
    notes: 'Regular shift, completed all assigned tasks'
  },
  {
    id: 'entry-2',
    userId: 'user-2',
    locationId: 'loc-1',
    date: '2024-12-17',
    hoursWorked: 8.5,
    status: 'approved',
    notes: 'Extended shift for inventory count'
  },
  {
    id: 'entry-3',
    userId: 'user-2',
    locationId: 'loc-2',
    date: '2024-12-18',
    hoursWorked: 7.5,
    status: 'pending',
    notes: 'Covered for colleague at Westside branch'
  },
  
  // Mike Johnson's entries
  {
    id: 'entry-4',
    userId: 'user-3',
    locationId: 'loc-2',
    date: '2024-12-16',
    hoursWorked: 8.0,
    status: 'approved',
    notes: 'Standard afternoon shift'
  },
  {
    id: 'entry-5',
    userId: 'user-3',
    locationId: 'loc-3',
    date: '2024-12-17',
    hoursWorked: 6.0,
    status: 'approved',
    notes: 'Mall kiosk evening shift'
  },
  {
    id: 'entry-6',
    userId: 'user-3',
    locationId: 'loc-2',
    date: '2024-12-18',
    hoursWorked: 8.0,
    status: 'pending',
    notes: 'Regular shift with customer training'
  },
  
  // Emma Wilson's entries
  {
    id: 'entry-7',
    userId: 'user-4',
    locationId: 'loc-3',
    date: '2024-12-17',
    hoursWorked: 5.0,
    status: 'approved',
    notes: 'Training shift at mall location'
  },
  {
    id: 'entry-8',
    userId: 'user-4',
    locationId: 'loc-1',
    date: '2024-12-18',
    hoursWorked: 7.0,
    status: 'pending',
    notes: 'Shadowing senior staff member'
  },
  
  // Alex Thompson's entries
  {
    id: 'entry-9',
    userId: 'user-5',
    locationId: 'loc-4',
    date: '2024-12-16',
    hoursWorked: 9.0,
    status: 'approved',
    notes: 'Corporate headquarters - special project'
  },
  {
    id: 'entry-10',
    userId: 'user-5',
    locationId: 'loc-1',
    date: '2024-12-17',
    hoursWorked: 8.0,
    status: 'approved',
    notes: 'Downtown office coordination'
  },
  {
    id: 'entry-11',
    userId: 'user-5',
    locationId: 'loc-2',
    date: '2024-12-18',
    hoursWorked: 7.5,
    status: 'pending',
    notes: 'Branch operations review'
  }
]

// Mock penalties
export const mockPenalties = [
  {
    id: '1',
    userId: '1',
    type: 'late_cancellation',
    shiftId: 'shift-5-morning',
    penaltyHours: 1,
    reason: 'Cancelled shift with less than 24 hours notice',
    appliedAt: '2024-01-20T08:00:00Z',
    appliedBy: '2'
  },
  {
    id: '2',
    userId: '3',
    type: 'no_show',
    shiftId: 'shift-3-afternoon',
    penaltyHours: 2,
    reason: 'Did not show up for scheduled shift',
    appliedAt: '2024-01-18T16:00:00Z',
    appliedBy: '2'
  }
]

// Mock notifications
export const mockNotifications = [
  {
    id: '1',
    userId: '1',
    type: 'shift_reminder',
    title: 'Shift Reminder',
    message: 'You have a shift starting in 1 hour at Main Store',
    isRead: false,
    createdAt: '2024-01-22T08:00:00Z',
    data: { shiftId: 'shift-7-morning' }
  },
  {
    id: '2',
    userId: '1',
    type: 'penalty_applied',
    title: 'Penalty Applied',
    message: 'A penalty of 1 hour has been applied for late cancellation',
    isRead: true,
    createdAt: '2024-01-20T08:00:00Z',
    data: { penaltyId: '1' }
  }
]

// Helper function to get user by ID
export const getUserById = (id) => mockUsers.find(user => user.id === id)

// Helper function to get location by ID
export const getLocationById = (id) => mockLocations.find(location => location.id === id)

// Helper function to get shifts by user ID
export const getShiftsByUserId = (userId) => {
  return mockShifts.filter(shift => shift.assignedTo === userId)
}

// Helper function to get available shifts
export const getAvailableShifts = () => {
  const now = new Date()
  return mockShifts.filter(shift => 
    shift.status === 'AVAILABLE' && 
    !shift.assignedTo && 
    new Date(shift.startTime) > now
  )
}

export const getUserShifts = (userId) => {
  return mockShifts.filter(shift => shift.assignedTo === userId)
}

export const getUserTimeEntries = (userId) => {
  return mockTimeEntries.filter(entry => entry.userId === userId)
} 