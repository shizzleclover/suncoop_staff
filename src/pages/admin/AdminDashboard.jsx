import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
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
  Shield,
  CheckCircle,
  Plus,
  ArrowRight,
  DollarSign,
  UserPlus,
  CalendarDays,
  Timer
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usersApi, shiftsApi, timeTrackingApi } from '../../lib/api'
import { useToast } from '../../hooks/use-toast'
import { formatTime, formatDate, formatDateShort } from '../../lib/utils'
import AdminProtection from '../../components/AdminProtection'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStaff: 0,
      activeStaff: 0,
      activeShifts: 0,
      pendingApprovals: 0,
      totalHoursThisMonth: 0,
      shiftsThisWeek: 0
    },
    upcomingShifts: [],
    recentActivity: [],
    topPerformers: [],
    pendingTimeEntries: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load stats in parallel
      const [
        usersStatsResponse,
        shiftsResponse,
        pendingTimeEntriesResponse,
        currentlyWorkingResponse
      ] = await Promise.all([
        usersApi.getUserStats(),
        shiftsApi.getShifts({
          startDate: new Date().toISOString(),
          limit: 10,
          sortBy: 'startTime',
          sortOrder: 'asc'
        }),
        timeTrackingApi.getPendingApprovals(),
        timeTrackingApi.getCurrentlyWorking()
      ])

      // Calculate stats
      const stats = {
        totalStaff: usersStatsResponse.data.totalUsers || 0,
        activeStaff: usersStatsResponse.data.activeUsers || 0,
        activeShifts: currentlyWorkingResponse.data.timeEntries?.length || 0,
        pendingApprovals: pendingTimeEntriesResponse.data.timeEntries?.length || 0,
        totalHoursThisMonth: 0, // Will be calculated from time entries
        shiftsThisWeek: shiftsResponse.data.shifts?.length || 0
      }

      // Get upcoming shifts (next 5)
      const upcomingShifts = shiftsResponse.data.shifts
        ?.filter(shift => new Date(shift.startTime) > new Date())
        ?.slice(0, 5) || []

      // Initialize empty arrays for activity and performers
      const recentActivity = []
      const topPerformers = []

      setDashboardData({
        stats,
        upcomingShifts,
        recentActivity,
        topPerformers,
        pendingTimeEntries: pendingTimeEntriesResponse.data.timeEntries || []
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
    <AdminProtection>
      <div className="space-y-4 p-4 lg:space-y-8 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 lg:pb-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="p-3 bg-blue-100 rounded-lg lg:p-4">
            <Shield className="h-6 w-6 text-blue-600 lg:h-8 lg:w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 lg:text-3xl">Management Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1 lg:text-base">
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
            <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalStaff}</div>
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
            <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeShifts}</div>
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
            <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalHoursThisMonth.toFixed(0)}</div>
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
            <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingApprovals}</div>
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
            {dashboardData.upcomingShifts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingShifts.map((shift) => {
                  const location = shift.locationId
                  const staff = shift.assignedTo
                  const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                  
                  return (
                    <div key={shift._id || shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {staff ? `${staff.firstName} ${staff.lastName}` : 'Unassigned'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {location?.name || 'Unknown Location'} • {formatTime(shift.startTime)} • {duration}h
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
            {dashboardData.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.topPerformers.map((staff, index) => (
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
            count={dashboardData.stats.totalStaff}
          />
          <QuickActionCard
            icon={Calendar}
            title="Shift Scheduling"
            description="Create and assign work shifts"
            link="/admin/shifts"
            color="green"
            count={dashboardData.upcomingShifts.length}
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
            count={dashboardData.stats.pendingApprovals}
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
            {dashboardData.recentActivity.map((activity, index) => {
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateShort(activity.time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminProtection>
  )
} 