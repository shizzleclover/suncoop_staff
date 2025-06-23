import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import BottomNav from './BottomNav'
import { 
  Home, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  BookOpen,
  MapPin
} from 'lucide-react'

const staffMenuItems = [
  { icon: Home, label: 'Dashboard', href: '/staff/dashboard' },
  { icon: Calendar, label: 'Shifts', href: '/staff/shifts' },
  { icon: Clock, label: 'Time Tracking', href: '/staff/time-tracking' },
  { icon: User, label: 'Profile', href: '/staff/profile' },
]

const adminMenuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Staff', href: '/admin/staff' },
  { icon: Calendar, label: 'Shifts', href: '/admin/shifts' },
  { icon: MapPin, label: 'Locations', href: '/admin/locations' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: User, label: 'Profile', href: '/admin/profile' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

function AppSidebar({ user, onSignOut }) {
  const location = useLocation()
  const menuItems = user?.role === USER_ROLES.ADMIN ? adminMenuItems : staffMenuItems

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-semibold text-lg">SunCoop</span>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button 
            variant="ghost" 
            onClick={onSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default function Layout({ children }) {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="md:hidden" />
              
              <div className="flex-1" />
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/manual">
                        <BookOpen className="mr-2 h-4 w-4" />
                        User Manual
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={user?.role === USER_ROLES.ADMIN ? '/admin/profile' : '/staff/profile'}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={user?.role === USER_ROLES.ADMIN ? '/admin/settings' : '/staff/profile'}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-muted/10 pb-20 md:pb-6">
            {children}
          </main>
        </div>
        
        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </SidebarProvider>
  )
} 