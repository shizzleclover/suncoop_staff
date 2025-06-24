import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  User,
  BarChart3,
  ClipboardList,
  LogOut,
  LogIn,
  Timer,
  TrendingUp,
  Users,
  Building2,
  Activity,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useAuthStore } from '../../store/authStore'
import { 
  shiftsApi, 
  timeTrackingApi, 
  locationsApi,
  usersApi 
} from '../../lib/api'
import { 
  formatTime, 
  formatDate, 
  formatDateShort, 
  calculateHours,
  isToday,
  isTomorrow 
} from '../../lib/utils'
import toast from 'react-hot-toast'

// Location data helper
const locations = [
  { _id: '1', name: 'Main Office', address: '123 Business St', city: 'Downtown' },
  { _id: '2', name: 'Branch Office', address: '456 Commerce Ave', city: 'Uptown' },
  { _id: '3', name: 'Warehouse', address: '789 Industrial Blvd', city: 'Industrial District' }
]

export default function StaffDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [clockedIn, setClockedIn] = useState(false)
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const [dashboardData, setDashboardData] = useState({
    upcomingShifts: [],
    recentTimeEntries: [],
    weeklyStats: {
      totalHours: 0,
      shiftsCompleted: 0,
      hoursThisWeek: 0,
      averageRating: 0
    },
    todayShift: null,
    locations: []
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Update elapsed time every second if clocked in
  useEffect(() => {
    let interval
    if (clockedIn && currentTimeEntry?.clockInTime) {
      interval = setInterval(() => {
        const start = new Date(currentTimeEntry.clockInTime)
        const now = new Date()
        setElapsedTime(Math.floor((now - start) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [clockedIn, currentTimeEntry])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user's shifts and time entries
      const [shiftsResponse, timeEntriesResponse] = await Promise.all([
        shiftsApi.getUserShifts({ 
          limit: 10, 
          sortBy: 'startTime', 
          sortOrder: 'asc' 
        }),
        timeTrackingApi.getMyTimeEntries({ 
          limit: 5, 
          sortBy: 'date', 
          sortOrder: 'desc' 
        })
      ])

      const shifts = shiftsResponse.data.shifts || []
      const timeEntries = timeEntriesResponse.data.timeEntries || []
      
      // Find if user is currently clocked in
      const currentEntry = timeEntries.find(entry => 
        entry.status === 'clocked_in' && !entry.clockOutTime
      )
      
      if (currentEntry) {
        setClockedIn(true)
        setCurrentTimeEntry(currentEntry)
      }

      // Calculate today's shift
      const todayShift = shifts.find(shift => 
        isToday(shift.startTime) && shift.assignedTo?.id === user.id
      )

      // Calculate weekly stats
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      
      const weeklyEntries = timeEntries.filter(entry => 
        new Date(entry.date) >= weekStart && entry.status === 'approved'
      )
      
      const weeklyStats = {
        totalHours: weeklyEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0),
        shiftsCompleted: weeklyEntries.length,
        hoursThisWeek: weeklyEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0),
        averageRating: 4.5 // Mock data
      }

      // Get upcoming shifts (next 5)
      const upcomingShifts = shifts
        .filter(shift => new Date(shift.startTime) > new Date())
        .slice(0, 5)

      setDashboardData({
        upcomingShifts,
        recentTimeEntries: timeEntries.slice(0, 5),
        weeklyStats,
        todayShift,
        locations
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    try {
      const location = locations[0] // Default to first location
      
      const response = await timeTrackingApi.clockIn(location._id)
      
      setClockedIn(true)
      setCurrentTimeEntry(response.data.timeEntry)
      toast.success('Clocked in successfully!')
      
      // Reload dashboard data
      loadDashboardData()
      
    } catch (error) {
      console.error('Clock in failed:', error)
      toast.error('Failed to clock in. Please try again.')
    }
  }

  const handleClockOut = async () => {
    try {
      await timeTrackingApi.clockOut(currentTimeEntry._id)
      
      setClockedIn(false)
      setCurrentTimeEntry(null)
      setElapsedTime(0)
      toast.success('Clocked out successfully!')
      
      // Reload dashboard data
      loadDashboardData()
      
    } catch (error) {
      console.error('Clock out failed:', error)
      toast.error('Failed to clock out. Please try again.')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const QuickActionCard = ({ icon: Icon, title, description, link, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      red: "bg-red-50 text-red-600 border-red-200"
    }
    
    return (
      <Link to={link} className="block">
        <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${colorClasses[color] || colorClasses.blue}`}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 rounded-lg bg-white/50 lg:p-3">
                <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                  {title}
                </h3>
                <p className="text-xs text-gray-600 lg:text-sm line-clamp-2">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 lg:text-sm">{title}</p>
            <p className="text-lg font-bold text-gray-900 lg:text-2xl mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1 lg:text-sm">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg lg:p-3 ${
            color === 'green' ? 'bg-green-100' :
            color === 'blue' ? 'bg-blue-100' :
            color === 'orange' ? 'bg-orange-100' :
            color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${
              color === 'green' ? 'text-green-600' :
              color === 'blue' ? 'text-blue-600' :
              color === 'orange' ? 'text-orange-600' :
              color === 'purple' ? 'text-purple-600' : 'text-gray-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="space-y-4 p-4 lg:space-y-6 lg:p-6 max-w-7xl mx-auto pb-safe">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-sm text-gray-600 lg:text-base">
            {clockedIn ? 'You are currently clocked in' : 'Ready to start your workday?'}
          </p>
        </div>
        
        {/* Clock In/Out Button */}
        <div className="w-full sm:w-auto">
          {clockedIn ? (
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-xs text-gray-500 lg:text-sm">Working for</p>
                <p className="text-lg font-mono font-bold text-green-600 lg:text-xl">
                  {formatElapsedTime(elapsedTime)}
                </p>
              </div>
              <Button 
                onClick={handleClockOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleClockIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Clock In
            </Button>
          )}
        </div>
      </div>

      {/* Today's Shift Alert */}
      {dashboardData.todayShift && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start gap-3 lg:gap-4">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 lg:h-6 lg:w-6" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900 text-sm lg:text-base">
                  You have a shift today!
                </h3>
                <p className="text-xs text-blue-700 mt-1 lg:text-sm">
                  {formatTime(dashboardData.todayShift.startTime)} - {formatTime(dashboardData.todayShift.endTime)}
                  {' at '} 
                  {locations.find(loc => loc._id === (dashboardData.todayShift.locationId?._id || dashboardData.todayShift.locationId))?.name || dashboardData.todayShift.locationId?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Hours This Week"
          value={`${dashboardData.weeklyStats.hoursThisWeek.toFixed(1)}h`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Shifts Completed"
          value={dashboardData.weeklyStats.shiftsCompleted}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Hours"
          value={`${dashboardData.weeklyStats.totalHours.toFixed(1)}h`}
          icon={Timer}
          color="purple"
        />
        <StatCard
          title="Performance"
          value={`${(dashboardData.weeklyStats.averageRating * 20).toFixed(0)}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Upcoming Shifts */}
          <Card>
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Calendar className="h-5 w-5" />
                Upcoming Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {dashboardData.upcomingShifts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.upcomingShifts.map((shift) => {
                    const location = locations.find(loc => loc._id === (shift.locationId?._id || shift.locationId)) || shift.locationId
                    const duration = calculateHours(shift.startTime, shift.endTime)
                    
                    return (
                      <div key={shift._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg lg:p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                              {location?.name || 'Unknown Location'}
                            </p>
                            <p className="text-xs text-gray-600 lg:text-sm">
                              {formatTime(shift.startTime)} • {duration}h
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {isToday(shift.startTime) ? 'Today' :
                             isTomorrow(shift.startTime) ? 'Tomorrow' :
                             formatDate(shift.startTime)}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3 lg:h-12 lg:w-12" />
                  <p className="text-sm text-gray-600 lg:text-base">No upcoming shifts</p>
                  <p className="text-xs text-gray-500 mt-1 lg:text-sm">Check back later for new assignments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Time Entries */}
          <Card>
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <ClipboardList className="h-5 w-5" />
                Recent Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {dashboardData.recentTimeEntries.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentTimeEntries.map((entry) => {
                    const location = locations.find(loc => loc._id === (entry.locationId?._id || entry.locationId)) || entry.locationId
                    
                    return (
                      <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg lg:p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                              {location?.name || 'Unknown Location'}
                            </p>
                            <p className="text-xs text-gray-600 lg:text-sm">
                              {formatDate(entry.date)} • {entry.hoursWorked?.toFixed(1) || '0.0'}h
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={
                              entry.status === 'approved' ? 'default' :
                              entry.status === 'pending' ? 'secondary' :
                              entry.status === 'rejected' ? 'destructive' : 'outline'
                            }
                            className="text-xs"
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8">
                  <ClipboardList className="h-10 w-10 text-gray-400 mx-auto mb-3 lg:h-12 lg:w-12" />
                  <p className="text-sm text-gray-600 lg:text-base">No time entries yet</p>
                  <p className="text-xs text-gray-500 mt-1 lg:text-sm">Clock in to start tracking your time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        

        
        <TabsContent value="actions" className="mt-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 lg:text-lg lg:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              <QuickActionCard
                icon={Calendar}
                title="My Shifts"
                description="View and manage your shifts"
                link="/staff/shifts"
                color="blue"
              />
              <QuickActionCard
                icon={Clock}
                title="Time Tracking"
                description="View your time entries"
                link="/staff/time-tracking"
                color="green"
              />
              <QuickActionCard
                icon={User}
                title="My Profile"
                description="Update your information"
                link="/staff/profile"
                color="purple"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
} 