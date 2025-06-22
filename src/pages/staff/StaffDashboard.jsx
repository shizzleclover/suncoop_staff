import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { formatTime, formatDate, BUSINESS_RULES, SHIFT_STATUS, isToday, isTomorrow } from '../../lib/utils'
import { mockShifts, mockTimeEntries, getLocationById } from '../../data/mockData'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Wifi, 
  TrendingUp,
  AlertTriangle,
  Play,
  Square,
  ChevronRight,
  CheckCircle,
  Users,
  BarChart3,
  Activity,
  AlertCircle,
  Building2,
  Timer,
  FileText,
  Target,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffDashboard() {
  const { user } = useAuthStore()
  const [isWorking, setIsWorking] = useState(false)
  const [currentShift, setCurrentShift] = useState(null)
  const [todaysShifts, setTodaysShifts] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({
    hoursWorked: 0,
    shiftsCompleted: 0,
    averageShift: 0
  })
  const [locationStatus, setLocationStatus] = useState({
    isVerified: false,
    method: null,
    accuracy: null
  })
  const [todayShifts, setTodayShifts] = useState([])
  const [upcomingShifts, setUpcomingShifts] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
    checkLocationStatus()
  }, [user?.id])

  const loadDashboardData = () => {
    if (!user?.id) return

    // Get user's shifts for today
    const today = new Date().toDateString()
    const userShifts = mockShifts.filter(shift => 
      shift.assignedTo === user.id && 
      new Date(shift.startTime).toDateString() === today
    )
    setTodaysShifts(userShifts)

    // Get weekly stats
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    
    const userEntries = mockTimeEntries.filter(entry => 
      entry.userId === user.id &&
      new Date(entry.clockInTime) >= weekStart
    )

    const hoursWorked = userEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
    
    setWeeklyStats({
      hoursWorked,
      shiftsCompleted: userEntries.length,
      averageShift: 0
    })

    // Check if currently working
    const activeEntry = userEntries.find(entry => entry.clockInTime && !entry.clockOutTime)
    if (activeEntry) {
      setIsWorking(true)
      const shift = mockShifts.find(s => s.id === activeEntry.shiftId)
      setCurrentShift(shift)
    }

    // Today's shifts
    const todayShiftsList = userShifts.filter(shift => 
      new Date(shift.startTime).toDateString() === today
    )
    setTodayShifts(todayShiftsList)

    // Upcoming shifts (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const upcoming = userShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime)
      return shiftDate > new Date() && shiftDate <= nextWeek
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    setUpcomingShifts(upcoming.slice(0, 5))

    // Recent activity
    const recent = [
      ...userEntries.map(entry => ({
        type: 'timesheet',
        date: entry.date,
        description: `Logged ${entry.hoursWorked} hours at ${getLocationById(entry.locationId)?.name}`,
        icon: Clock
      })),
      ...userShifts.map(shift => ({
        type: 'shift',
        date: shift.startTime,
        description: `Completed shift at ${getLocationById(shift.locationId)?.name}`,
        icon: Calendar
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    
    setRecentActivity(recent)
  }

  const checkLocationStatus = () => {
    // Mock location verification
    const mockVerification = () => {
      setLocationStatus({
        isVerified: Math.random() > 0.3, // 70% success rate
        method: Math.random() > 0.5 ? 'WiFi' : 'GPS',
        accuracy: Math.floor(Math.random() * 20) + 5 // 5-25 meters
      })
    }

    mockVerification()
    // Recheck every 30 seconds
    const interval = setInterval(mockVerification, 30000)
    return () => clearInterval(interval)
  }

  const handleClockIn = async () => {
    if (!locationStatus.isVerified) {
      toast.error('Location verification required to clock in')
      return
    }

    try {
      setIsWorking(true)
      toast.success('Clocked in successfully!')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to clock in')
    }
  }

  const handleClockOut = async () => {
    try {
      setIsWorking(false)
      setCurrentShift(null)
      toast.success('Clocked out successfully!')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to clock out')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const QuickActionCard = ({ icon: Icon, title, description, link, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600", 
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600"
    }
    
    return (
      <Link to={link}>
        <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.displayName || user?.username}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your workforce overview for today
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hours This Week</CardTitle>
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{weeklyStats.hoursWorked.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Productive work hours logged</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Shifts Completed</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{weeklyStats.shiftsCompleted}</div>
            <p className="text-xs text-gray-500 mt-1">Assignments this week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Average Shift Duration</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{weeklyStats.averageShift.toFixed(1)}h</div>
            <p className="text-xs text-gray-500 mt-1">Per shift average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayShifts.length > 0 ? (
              <div className="space-y-3">
                {todayShifts.map((shift) => {
                  const location = getLocationById(shift.locationId)
                  const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                  const isActive = new Date() >= new Date(shift.startTime) && new Date() <= new Date(shift.endTime)
                  
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{location?.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)} • {duration}h
                          </p>
                        </div>
                      </div>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? 'Active' : 'Scheduled'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No shifts scheduled for today</p>
                <p className="text-sm text-gray-500">Enjoy your day off!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length > 0 ? (
              <div className="space-y-3">
                {upcomingShifts.map((shift) => {
                  const location = getLocationById(shift.locationId)
                  const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                  
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <MapPin className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{location?.name}</p>
                          <p className="text-xs text-gray-600">
                            {formatDate(shift.startTime)} • {formatTime(shift.startTime)} • {duration}h
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Timer className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No upcoming shifts</p>
                <Link to="/staff/shifts">
                  <Button variant="outline" size="sm" className="mt-2">
                    Browse Available Shifts
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={Clock}
            title="Time Tracking"
            description="View hours worked and performance"
            link="/staff/time-tracking"
            color="blue"
          />
          <QuickActionCard
            icon={Calendar}
            title="Manage Shifts"
            description="Book or modify work assignments"
            link="/staff/shifts"
            color="green"
          />
          <QuickActionCard
            icon={FileText}
            title="Documents"
            description="Access contracts and policies"
            link="/staff/documents"
            color="purple"
          />
          <QuickActionCard
            icon={Users}
            title="My Profile"
            description="Update personal information"
            link="/staff/profile"
            color="orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isWorking ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isWorking ? 'Clocked in' : 'Not clocked in'}
              </span>
              {currentShift && (
                <Badge variant="secondary">
                  {getLocationById(currentShift.locationId)?.name}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isWorking ? (
                <Button onClick={handleClockIn} disabled={!locationStatus.isVerified}>
                  <Play className="h-4 w-4 mr-2" />
                  Clock In
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleClockOut}>
                  <Square className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>

          {/* Location Status */}
          <div className="mt-4 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Location Verification</span>
                <Badge variant={locationStatus.isVerified ? "default" : "destructive"}>
                  {locationStatus.isVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              {locationStatus.isVerified && (
                <span className="text-xs text-muted-foreground">
                  via {locationStatus.method} ({locationStatus.accuracy}m)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders/Alerts */}
      {!locationStatus.isVerified && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Location verification is required to clock in. Please ensure you're connected to the workplace WiFi or your GPS is enabled.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 