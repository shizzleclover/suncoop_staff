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

  // Don't show bottom nav on login page or setup pages
  if (location.pathname === '/login' || location.pathname === '/admin/setup' || location.pathname === '/staff-register') {
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
    <nav className="bottom-nav-fixed md:hidden safe-area-padding-bottom">
      <div className={`grid ${navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-button no-select ${
                item.active
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
              type="button"
              aria-label={item.label}
            >
              <IconComponent className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
} 