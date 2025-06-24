import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  Building2 
} from 'lucide-react'
import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Don't show bottom nav on login page
  if (location.pathname === '/login') {
    return null
  }

  const staffNavItems = [
    {
      path: '/staff/dashboard',
      icon: Home,
      label: 'Home',
      active: location.pathname === '/staff/dashboard'
    },
    {
      path: '/staff/shifts',
      icon: Calendar,
      label: 'Shifts',
      active: location.pathname === '/staff/shifts'
    },
    {
      path: '/staff/time-tracking',
      icon: Clock,
      label: 'Time',
      active: location.pathname === '/staff/time-tracking'
    },
    {
      path: '/staff/profile',
      icon: User,
      label: 'Profile',
      active: location.pathname === '/staff/profile'
    }
  ]

  const adminNavItems = [
    {
      path: '/admin/dashboard',
      icon: Home,
      label: 'Home',
      active: location.pathname === '/admin/dashboard'
    },
    {
      path: '/admin/staff',
      icon: Users,
      label: 'Staff',
      active: location.pathname === '/admin/staff'
    },
    {
      path: '/admin/shifts',
      icon: Building2,
      label: 'Shifts',
      active: location.pathname === '/admin/shifts'
    },
    {
      path: '/admin/reports',
      icon: BarChart3,
      label: 'Reports',
      active: location.pathname === '/admin/reports'
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Settings',
      active: location.pathname === '/admin/settings'
    }
  ]

  const navItems = user?.role === USER_ROLES.STAFF ? staffNavItems : adminNavItems

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className={`grid ${navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} safe-area-padding-bottom`}>
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors ${
                item.active
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-4 h-4 mb-1 sm:w-5 sm:h-5" />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 