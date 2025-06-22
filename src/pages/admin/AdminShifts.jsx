import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  MapPin,
  Users
} from 'lucide-react'
import { mockShifts, mockLocations, getLocationById } from '../../data/mockData'
import { formatTime, formatDate, SHIFT_STATUS } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminShifts() {
  const [shifts, setShifts] = useState([])
  const [filteredShifts, setFilteredShifts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    // Load shifts data
    setShifts(mockShifts)
    setFilteredShifts(mockShifts)
  }, [])

  useEffect(() => {
    // Filter shifts based on search and filters
    let filtered = shifts

    if (searchTerm) {
      filtered = filtered.filter(shift => {
        const location = getLocationById(shift.locationId)
        return location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               shift.description.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => shift.status === statusFilter)
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(shift => shift.locationId === locationFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter(shift => 
        new Date(shift.startTime).toDateString() === new Date(dateFilter).toDateString()
      )
    }

    setFilteredShifts(filtered)
  }, [searchTerm, statusFilter, locationFilter, dateFilter, shifts])

  const handleDeleteShift = (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      setShifts(prev => prev.filter(shift => shift.id !== shiftId))
      toast.success('Shift deleted successfully')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case SHIFT_STATUS.AVAILABLE:
        return 'bg-blue-100 text-blue-800'
      case SHIFT_STATUS.BOOKED:
        return 'bg-green-100 text-green-800'
      case SHIFT_STATUS.COMPLETED:
        return 'bg-gray-100 text-gray-800'
      case SHIFT_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600">Create and manage work shifts</p>
        </div>
        <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Shift
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value={SHIFT_STATUS.AVAILABLE}>Available</option>
              <option value={SHIFT_STATUS.BOOKED}>Booked</option>
              <option value={SHIFT_STATUS.COMPLETED}>Completed</option>
              <option value={SHIFT_STATUS.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
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

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setLocationFilter('all')
                setDateFilter('')
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === SHIFT_STATUS.AVAILABLE).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Booked</p>
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === SHIFT_STATUS.BOOKED).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status === SHIFT_STATUS.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Shifts ({filteredShifts.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShifts.map((shift) => {
                const location = getLocationById(shift.locationId)
                const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                
                return (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center mb-1">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">
                            {location?.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{shift.description}</div>
                        <div className="text-xs text-gray-400">
                          {formatDate(shift.startTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                        <div className="text-xs text-gray-500">{duration}h duration</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {shift.currentCapacity}/{shift.maxCapacity}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(shift.currentCapacity / shift.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                                                  {((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                        {shift.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-amber-600 hover:text-amber-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || locationFilter !== 'all' || dateFilter
                ? 'Try adjusting your filters' 
                : 'Create your first shift to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 