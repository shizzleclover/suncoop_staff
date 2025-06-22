import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  BarChart3,
  Activity,
  FileText,
  Settings,
  Target,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Shield
} from 'lucide-react'
import { mockUsers, mockShifts, mockTimeEntries, getLocationById } from '../../data/mockData'
import { formatTime, formatDate, SHIFT_STATUS } from '../../lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeShifts: 0,
    monthlyHours: 0,
    alertsCount: 0
  })
  const [upcomingShifts, setUpcomingShifts] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [staffPerformance, setStaffPerformance] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Calculate stats
    const totalStaff = mockUsers.filter(user => user.role === 'staff').length
    const today = new Date()
    const activeShifts = mockShifts.filter(shift => {
      const shiftStart = new Date(shift.startTime)
      const shiftEnd = new Date(shift.endTime)
      return today >= shiftStart && today <= shiftEnd && shift.status === SHIFT_STATUS.BOOKED
    }).length

    // Calculate monthly hours (current week * 4 as estimate)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    
    const thisWeekHours = mockTimeEntries
      .filter(entry => new Date(entry.date) >= weekStart)
      .reduce((sum, entry) => sum + entry.hoursWorked, 0)
    
    const monthlyHours = thisWeekHours * 4 // Estimate

    // Mock alerts count
    const alertsCount = 3

    setStats({
      totalStaff,
      activeShifts,
      monthlyHours,
      alertsCount
    })

    // Get upcoming shifts (next 24 hours)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const upcoming = mockShifts
      .filter(shift => {
        const shiftDate = new Date(shift.startTime)
        return shiftDate > today && shiftDate <= tomorrow && shift.assignedTo
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5)
    
    setUpcomingShifts(upcoming)

    // Recent activity
    const recent = [
      { type: 'shift_booking', user: 'Sarah Chen', action: 'Booked morning shift at Downtown Location', time: '2 hours ago', icon: Calendar },
      { type: 'timesheet', user: 'Mike Johnson', action: 'Submitted timesheet for last week', time: '4 hours ago', icon: Clock },
      { type: 'staff_join', user: 'Emma Wilson', action: 'Joined the team as new staff member', time: '1 day ago', icon: Users },
      { type: 'shift_complete', user: 'Alex Thompson', action: 'Completed evening shift at Mall Location', time: '1 day ago', icon: UserCheck },
      { type: 'system', user: 'System', action: 'Generated monthly performance reports', time: '2 days ago', icon: FileText }
    ]
    setRecentActivity(recent)

    // Staff performance summary
    const performance = mockUsers
      .filter(user => user.role === 'staff')
      .slice(0, 5)
      .map(user => {
        const userEntries = mockTimeEntries.filter(entry => entry.userId === user.id)
        const totalHours = userEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0)
        const shiftsCount = mockShifts.filter(shift => shift.assignedTo === user.id).length
        
        return {
          ...user,
          totalHours,
          shiftsCount,
          performance: Math.floor(Math.random() * 20) + 80 // Mock performance score
        }
      })
      .sort((a, b) => b.totalHours - a.totalHours)
    
    setStaffPerformance(performance)
  }

  const QuickActionCard = ({ icon: Icon, title, description, link, color = "blue", count }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600", 
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      gray: "bg-gray-50 text-gray-600",
      red: "bg-red-50 text-red-600"
    }
    
    return (
      <Link to={link}>
        <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer border-l-4 border-l-blue-600">
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
              <div className="flex items-center gap-2">
                {count && (
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Workforce overview and operational insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Staff Members</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{stats.totalStaff}</div>
            <p className="text-xs text-gray-500 mt-1">Active workforce</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Shifts</CardTitle>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{stats.activeShifts}</div>
            <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Hours</CardTitle>
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{stats.monthlyHours.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">Total hours this month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">System Alerts</CardTitle>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{stats.alertsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Shifts (Next 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length > 0 ? (
              <div className="space-y-3">
                {upcomingShifts.map((shift) => {
                  const location = getLocationById(shift.locationId)
                  const staff = mockUsers.find(u => u.id === shift.assignedTo)
                  const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                  
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff?.displayName || 'Unassigned'}</p>
                          <p className="text-sm text-gray-600">
                            {location?.name} • {formatTime(shift.startTime)} • {duration}h
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {formatDate(shift.startTime)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No shifts scheduled</p>
                <p className="text-sm text-gray-500">for the next 24 hours</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffPerformance.length > 0 ? (
              <div className="space-y-3">
                {staffPerformance.map((staff, index) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.displayName}</p>
                        <p className="text-sm text-gray-600">{staff.totalHours.toFixed(1)}h • {staff.shiftsCount} shifts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={staff.performance >= 90 ? "default" : "secondary"}>
                        {staff.performance}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Management Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Users}
            title="Staff Management"
            description="Manage team members and roles"
            link="/admin/staff"
            color="blue"
            count={stats.totalStaff}
          />
          <QuickActionCard
            icon={Calendar}
            title="Shift Scheduling"
            description="Create and assign work shifts"
            link="/admin/shifts"
            color="green"
            count={upcomingShifts.length}
          />
          <QuickActionCard
            icon={BarChart3}
            title="Analytics & Reports"
            description="View performance metrics"
            link="/admin/reports"
            color="purple"
          />
          <QuickActionCard
            icon={ClipboardList}
            title="Time & Attendance"
            description="Review timesheets and hours"
            link="/admin/time-tracking"
            color="orange"
          />
          <QuickActionCard
            icon={Settings}
            title="System Settings"
            description="Configure platform settings"
            link="/admin/settings"
            color="gray"
          />
          <QuickActionCard
            icon={AlertTriangle}
            title="System Alerts"
            description="Review system notifications"
            link="/admin/alerts"
            color="red"
            count={stats.alertsCount}
          />
        </div>
      </div>

      {/* Recent System Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 