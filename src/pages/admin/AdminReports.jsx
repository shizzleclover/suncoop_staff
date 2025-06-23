import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../hooks/use-toast'
import { formatTime, formatDate, formatDateShort } from '../../lib/utils'
import { reportsApi, timeTrackingApi, shiftsApi, usersApi, locationsApi } from '../../lib/api'

export default function AdminReports() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [reportData, setReportData] = useState({
    timeEntries: [],
    shifts: [],
    users: [],
    locations: [],
    analytics: {
      totalHours: 0,
      totalShifts: 0,
      activeStaff: 0,
      averageHours: 0,
      punctualityRate: 0,
      completionRate: 0
    }
  })

  useEffect(() => {
    loadReportsData()
  }, [selectedMonth, selectedYear, selectedLocation])

  const loadReportsData = async () => {
    setIsLoading(true)
    try {
      // Calculate date range for the selected month/year
      const startDate = new Date(selectedYear, selectedMonth, 1)
      const endDate = new Date(selectedYear, selectedMonth + 1, 0)

      // Fetch all required data in parallel
      const [
        timeEntriesResponse,
        shiftsResponse, 
        usersResponse,
        locationsResponse
      ] = await Promise.all([
        timeTrackingApi.getTimeEntries({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 1000
        }),
        shiftsApi.getShifts({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 1000
        }),
        usersApi.getUsers({ limit: 1000 }),
        locationsApi.getActiveLocations()
      ])

      let timeEntries = []
      let shifts = []
      let users = []
      let locations = []

      if (timeEntriesResponse.success) {
        timeEntries = timeEntriesResponse.data.timeEntries || []
      }

      if (shiftsResponse.success) {
        shifts = shiftsResponse.data.shifts || []
      }

      if (usersResponse.success) {
        users = usersResponse.data.users || []
      }

      if (locationsResponse.success) {
        locations = locationsResponse.data.locations || []
      }

      // Filter by location if selected
      if (selectedLocation && selectedLocation !== 'all') {
        timeEntries = timeEntries.filter(entry => 
          (entry.locationId._id || entry.locationId) === selectedLocation
        )
        shifts = shifts.filter(shift => 
          (shift.locationId._id || shift.locationId) === selectedLocation
        )
      }

      // Calculate analytics
      const analytics = calculateAnalytics(timeEntries, shifts, users)

      setReportData({
        timeEntries,
        shifts,
        users,
        locations,
        analytics
      })

    } catch (error) {
      console.error('Failed to load reports data:', error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAnalytics = (timeEntries, shifts, users) => {
    // Calculate total hours worked
    const totalHours = timeEntries
      .filter(entry => entry.status === 'approved')
      .reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)

    // Calculate total shifts
    const totalShifts = shifts.length

    // Calculate active staff (users with time entries in the period)
    const staffWithEntries = new Set(timeEntries.map(entry => entry.userId._id || entry.userId))
    const activeStaff = staffWithEntries.size

    // Calculate average hours per staff member
    const averageHours = activeStaff > 0 ? totalHours / activeStaff : 0

    // Calculate punctuality rate (mock calculation - would need actual late clock-ins data)
    const punctualityRate = 85 // Placeholder

    // Calculate completion rate
    const completedShifts = shifts.filter(shift => shift.status === 'COMPLETED').length
    const completionRate = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalShifts,
      activeStaff,
      averageHours: Math.round(averageHours * 10) / 10,
      punctualityRate,
      completionRate: Math.round(completionRate * 10) / 10
    }
  }

  const exportReport = () => {
    const { analytics } = reportData
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })
    
    const csvContent = [
      ['Report Period', `${monthName} ${selectedYear}`],
      [''],
      ['Metric', 'Value'],
      ['Total Hours Worked', analytics.totalHours],
      ['Total Shifts', analytics.totalShifts], 
      ['Active Staff', analytics.activeStaff],
      ['Average Hours per Staff', analytics.averageHours],
      ['Punctuality Rate', `${analytics.punctualityRate}%`],
      ['Completion Rate', `${analytics.completionRate}%`]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suncoop-report-${monthName}-${selectedYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow h-32"></div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 shadow h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Workforce insights and performance metrics</p>
          </div>
          <Button onClick={exportReport} className="bg-amber-600 hover:bg-amber-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {reportData.locations.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={loadReportsData}
                  className="w-full"
                >
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.analytics.totalHours}</p>
                  <p className="text-xs text-gray-500">Hours worked</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.analytics.totalShifts}</p>
                  <p className="text-xs text-gray-500">Shifts scheduled</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.analytics.activeStaff}</p>
                  <p className="text-xs text-gray-500">Staff members</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Hours/Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.analytics.averageHours}</p>
                  <p className="text-xs text-gray-500">Per staff member</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Punctuality Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${reportData.analytics.punctualityRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{reportData.analytics.punctualityRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Shift Completion Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${reportData.analytics.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{reportData.analytics.completionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Breakdown</CardTitle>
              <CardDescription>Distribution across locations</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.locations.length > 0 ? (
                <div className="space-y-3">
                  {reportData.locations.map((location) => {
                    const locationEntries = reportData.timeEntries.filter(entry => 
                      (entry.locationId._id || entry.locationId) === location._id
                    )
                    const locationHours = locationEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
                    
                    return (
                      <div key={location._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{location.name}</p>
                          <p className="text-sm text-gray-600">{location.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{Math.round(locationHours * 10) / 10}h</p>
                          <p className="text-sm text-gray-600">{locationEntries.length} entries</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No location data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
            <CardDescription>Latest time tracking submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.timeEntries.length > 0 ? (
              <div className="space-y-4">
                {reportData.timeEntries.slice(0, 10).map((entry) => {
                  const location = reportData.locations.find(loc => 
                    loc._id === (entry.locationId._id || entry.locationId)
                  )
                  
                  return (
                    <div key={entry._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.userId.firstName} {entry.userId.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateShort(entry.date)} • {entry.hoursWorked || 0} hours
                          </p>
                          <p className="text-sm text-gray-500">
                            {location?.name || 'Unknown Location'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          entry.status === 'approved' ? 'default' :
                          entry.status === 'pending' ? 'secondary' :
                          entry.status === 'rejected' ? 'destructive' : 'outline'
                        }
                        className={
                          entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                          entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          entry.status === 'rejected' ? 'bg-red-100 text-red-800' : ''
                        }
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-500">
                  No time entries found for the selected period and filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 