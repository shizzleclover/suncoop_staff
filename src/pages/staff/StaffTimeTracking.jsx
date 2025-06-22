import { useState, useEffect } from 'react'
import { 
  Clock, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Wifi,
  BarChart3
} from 'lucide-react'
import { useStore } from '../../store'
import { mockTimeEntries, getLocationById } from '../../data/mockData'
import { formatTime, formatDate, calculateHours } from '../../lib/utils'

export default function StaffTimeTracking() {
  const { user, timeEntries, currentTimeEntry } = useStore()
  const [filteredEntries, setFilteredEntries] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('week') // week, month, all
  const [stats, setStats] = useState({
    totalHours: 0,
    averageShiftLength: 0,
    shiftsCompleted: 0
  })

  useEffect(() => {
    // Filter time entries based on selected period
    const now = new Date()
    let startDate

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate = new Date(0) // All time
    }

    const userEntries = timeEntries
      .filter(entry => entry.userId === user?.id)
      .filter(entry => new Date(entry.clockInTime) >= startDate)
      .sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime))

    setFilteredEntries(userEntries)

    // Calculate stats
    const totalHours = userEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0)
    const completedShifts = userEntries.filter(entry => entry.clockOutTime).length
    const averageShiftLength = completedShifts > 0 ? totalHours / completedShifts : 0

    setStats({
      totalHours,
      averageShiftLength,
      shiftsCompleted: completedShifts
    })

  }, [timeEntries, user, selectedPeriod])

  const TimeEntryCard = ({ entry }) => {
    const location = getLocationById(entry.shift?.locationId)
    const duration = entry.hoursWorked || calculateHours(entry.clockInTime, entry.clockOutTime || new Date())
    const isActive = !entry.clockOutTime

    return (
      <div className={`bg-white rounded-lg shadow border p-6 ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-gray-900">{location?.name || 'Unknown Location'}</h3>
              {isActive && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{formatDate(entry.clockInTime)}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {formatTime(entry.clockInTime)} - {entry.clockOutTime ? formatTime(entry.clockOutTime) : 'In Progress'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{duration.toFixed(1)}h</p>
            <p className="text-sm text-gray-500">Duration</p>
          </div>
        </div>

        {/* Location & WiFi Verification */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {entry.clockInLocation ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-xs text-gray-600">
                Clock In Location {entry.clockInLocation ? 'Verified' : 'Failed'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center">
              {entry.clockInWifi?.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-xs text-gray-600">
                WiFi {entry.clockInWifi?.isValid ? 'Verified' : 'Failed'}
              </span>
            </div>
          </div>

          {entry.clockOutTime && (
            <>
              <div className="flex items-center">
                <div className="flex items-center">
                  {entry.clockOutLocation ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className="text-xs text-gray-600">
                    Clock Out Location {entry.clockOutLocation ? 'Verified' : 'Failed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center">
                  {entry.clockOutWifi?.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className="text-xs text-gray-600">
                    WiFi {entry.clockOutWifi?.isValid ? 'Verified' : 'Failed'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Details */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">WiFi Network:</span> {entry.clockInWifi?.ssid || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Status:</span> {entry.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600">View your work history and hours worked</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Period</h2>
          <div className="flex space-x-2">
            {[
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'all', label: 'All Time' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Shift Length</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageShiftLength.toFixed(1)} hours
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shifts Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.shiftsCompleted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Active Session */}
      {currentTimeEntry && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
            <h2 className="text-lg font-semibold text-green-900">Currently Clocked In</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-green-700">Clock In Time</p>
              <p className="text-green-900">{formatTime(currentTimeEntry.clockInTime)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Duration</p>
              <p className="text-green-900">
                {calculateHours(currentTimeEntry.clockInTime, new Date()).toFixed(1)} hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Work History ({filteredEntries.length} entries)
          </h2>
        </div>
        
        <div className="p-6">
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <TimeEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
              <p className="text-gray-600">
                {selectedPeriod === 'all' 
                  ? "You haven't clocked in for any shifts yet." 
                  : `No work history found for the selected ${selectedPeriod === 'week' ? '7 days' : '30 days'}.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status Legend</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Verified</p>
              <p className="text-sm text-gray-600">Location and WiFi confirmation successful</p>
            </div>
          </div>
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Failed</p>
              <p className="text-sm text-gray-600">Verification could not be completed</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">GPS Location</p>
              <p className="text-sm text-gray-600">Geographic coordinates verified</p>
            </div>
          </div>
          <div className="flex items-center">
            <Wifi className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">WiFi Network</p>
              <p className="text-sm text-gray-600">Connected to authorized network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 