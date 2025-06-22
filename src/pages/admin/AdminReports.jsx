import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Clock,
  Users,
  MapPin
} from 'lucide-react'
import { mockUsers, mockShifts, mockTimeEntries, mockLocations, getLocationById } from '../../data/mockData'
import { formatDate, USER_ROLES, SHIFT_STATUS } from '../../lib/utils'

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('week') // week, month, quarter, year
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [analytics, setAnalytics] = useState({
    totalHours: 0,
    avgShiftLength: 0,
    totalShifts: 0,
    staffUtilization: 0,
    completionRate: 0
  })
  const [topPerformers, setTopPerformers] = useState([])
  const [locationStats, setLocationStats] = useState([])

  useEffect(() => {
    calculateAnalytics()
  }, [dateRange, selectedLocation])

  const calculateAnalytics = () => {
    // Calculate date range
    const now = new Date()
    let startDate
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0)
    }

    // Filter data by date range and location
    let filteredEntries = mockTimeEntries.filter(entry => 
      new Date(entry.clockInTime) >= startDate
    )
    
    let filteredShifts = mockShifts.filter(shift => 
      new Date(shift.startTime) >= startDate
    )

    if (selectedLocation !== 'all') {
      filteredShifts = filteredShifts.filter(shift => shift.locationId === selectedLocation)
      filteredEntries = filteredEntries.filter(entry => {
        const shift = mockShifts.find(s => s.id === entry.shiftId)
        return shift?.locationId === selectedLocation
      })
    }

    // Calculate analytics
    const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
    const avgShiftLength = filteredEntries.length > 0 ? totalHours / filteredEntries.length : 0
    const completedShifts = filteredShifts.filter(shift => shift.status === SHIFT_STATUS.COMPLETED)
    const completionRate = filteredShifts.length > 0 ? (completedShifts.length / filteredShifts.length) * 100 : 0

    // Calculate staff utilization
    const activeStaff = mockUsers.filter(user => user.role === USER_ROLES.STAFF && user.isActive)
    const staffWithHours = new Set(filteredEntries.map(entry => entry.userId))
    const staffUtilization = activeStaff.length > 0 ? (staffWithHours.size / activeStaff.length) * 100 : 0

    setAnalytics({
      totalHours,
      avgShiftLength,
      totalShifts: filteredShifts.length,
      staffUtilization,
      completionRate
    })

    // Calculate top performers
    const staffHours = {}
    filteredEntries.forEach(entry => {
      if (!staffHours[entry.userId]) {
        staffHours[entry.userId] = 0
      }
      staffHours[entry.userId] += entry.hoursWorked || 0
    })

    const performers = Object.entries(staffHours)
      .map(([userId, hours]) => {
        const user = mockUsers.find(u => u.id === userId)
        return { user, hours }
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    setTopPerformers(performers)

    // Calculate location stats
    const locationHours = {}
    filteredShifts.forEach(shift => {
      if (!locationHours[shift.locationId]) {
        locationHours[shift.locationId] = {
          hours: 0,
          shifts: 0
        }
      }
      const shiftEntries = filteredEntries.filter(entry => entry.shiftId === shift.id)
      const shiftHours = shiftEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
      
      locationHours[shift.locationId].hours += shiftHours
      locationHours[shift.locationId].shifts += 1
    })

    const locationData = Object.entries(locationHours)
      .map(([locationId, data]) => {
        const location = getLocationById(locationId)
        return { location, ...data }
      })
      .sort((a, b) => b.hours - a.hours)

    setLocationStats(locationData)
  }

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      dateRange,
      selectedLocation,
      analytics,
      topPerformers,
      locationStats,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suncoop-report-${dateRange}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Insights into your business performance</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Locations</option>
              {mockLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setDateRange('month')
                setSelectedLocation('all')
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Shift Length</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.avgShiftLength.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Staff Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.staffUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
          </div>
          <div className="p-6">
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.user?.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {performer.user?.firstName} {performer.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{performer.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{performer.hours.toFixed(1)}h</p>
                      <p className="text-sm text-gray-500">worked</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Location Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Location Performance</h2>
          </div>
          <div className="p-6">
            {locationStats.length > 0 ? (
              <div className="space-y-4">
                {locationStats.map((location) => (
                  <div key={location.location?.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{location.location?.name}</h3>
                      <span className="text-sm text-gray-500">{location.shifts} shifts</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Hours</p>
                        <p className="font-semibold">{location.hours.toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Shift</p>
                        <p className="font-semibold">{location.shifts > 0 ? (location.hours / location.shifts).toFixed(1) : '0.0'}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No location data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Analytics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Average Shift Length</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics.avgShiftLength.toFixed(1)}h</p>
              <p className="text-sm text-gray-500">across all shifts</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Shifts</h3>
              <p className="text-2xl font-bold text-green-600">{analytics.totalShifts}</p>
              <p className="text-sm text-gray-500">in selected period</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Active Locations</h3>
              <p className="text-2xl font-bold text-purple-600">{locationStats.length}</p>
              <p className="text-sm text-gray-500">with activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 