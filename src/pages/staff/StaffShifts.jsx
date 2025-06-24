import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { shiftsApi } from '../../lib/api'
import { useToast } from '../../hooks/use-toast'
import { formatTime, formatDate, isToday, isTomorrow, SHIFT_STATUS } from '../../lib/utils'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  BriefcaseIcon as Briefcase,
  Users,
  Filter,
  Search,
  Plus,
  Check,
  X,
  Timer,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function StaffShifts() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('available')
  const [isLoading, setIsLoading] = useState(true)
  const [availableShifts, setAvailableShifts] = useState([])
  const [userShifts, setUserShifts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    loadShifts()
  }, [user, activeTab])

  useEffect(() => {
    // Filter user's shifts
    let filtered = userShifts
    
    if (searchTerm) {
      filtered = filtered.filter(shift => {
        const location = getLocationById(shift.locationId)
        return location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               shift.description?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => shift.status.toLowerCase() === statusFilter)
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(shift => shift.locationId === locationFilter)
    }
    
    setUserShifts(filtered)
  }, [userShifts, searchTerm, statusFilter, locationFilter])

  useEffect(() => {
    // Filter available shifts
    let filtered = availableShifts
    
    if (searchTerm) {
      filtered = filtered.filter(shift => {
        const location = getLocationById(shift.locationId)
        return location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               shift.description?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(shift => shift.locationId === locationFilter)
    }
    
    setAvailableShifts(filtered)
  }, [availableShifts, searchTerm, locationFilter])

  const loadShifts = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      if (activeTab === 'available') {
        // Load available shifts
        const response = await shiftsApi.getAvailableShifts({
          startDate: new Date().toISOString(),
          limit: 50
        })
        setAvailableShifts(response.data.shifts || [])
      } else {
        // Load user's shifts
        const response = await shiftsApi.getUserShifts({
          limit: 50,
          sortBy: 'startTime',
          sortOrder: 'desc'
        })
        setUserShifts(response.data.shifts || [])
      }
    } catch (error) {
      console.error('Failed to load shifts:', error)
      toast({
        title: "Error",
        description: "Failed to load shifts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredShifts = (shiftList) => {
    return shiftList.filter(shift => {
      const location = getLocationById(shift.locationId)
      const matchesSearch = !searchTerm || 
        location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || shift.status.toLowerCase() === statusFilter
      const matchesLocation = locationFilter === 'all' || shift.locationId === locationFilter
      
      return matchesSearch && matchesStatus && matchesLocation
    })
  }

  const handleBookShift = async (shiftId) => {
    try {
      await shiftsApi.assignShift(shiftId, user.id)
      
      toast({
        title: "Success",
        description: "Shift booked successfully!",
      })
      
      // Refresh the shifts
      loadShifts()
    } catch (error) {
      console.error('Failed to book shift:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to book shift",
        variant: "destructive"
      })
    }
  }

  const handleCancelShift = async (shiftId) => {
    const shift = userShifts.find(s => s._id === shiftId)
    
    if (!shift) return
    
    // Check if shift can be cancelled (24 hours notice)
    const hoursUntilShift = (new Date(shift.startTime) - new Date()) / (1000 * 60 * 60)
    
    if (hoursUntilShift < 24) {
      toast({
        title: "Cannot Cancel",
        description: "Shifts must be cancelled at least 24 hours in advance",
        variant: "destructive"
      })
      return
    }

    try {
      await shiftsApi.unassignShift(shiftId)
      
      toast({
        title: "Success",
        description: "Shift cancelled successfully",
      })
      
      // Refresh the shifts
      loadShifts()
    } catch (error) {
      console.error('Failed to cancel shift:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel shift",
        variant: "destructive"
      })
    }
  }

  const getUniqueLocations = () => {
    const allShifts = activeTab === 'available' ? availableShifts : userShifts
    const locations = allShifts.map(shift => shift.locationId).filter(Boolean)
    return [...new Map(locations.map(loc => [loc._id, loc])).values()]
  }

  const getLocationById = (locationId) => {
    return getUniqueLocations().find(loc => loc._id === locationId)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-blue-100 text-blue-800'
      case 'booked': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const ShiftCard = ({ shift, isUserShift = false }) => {
    const location = getLocationById(shift.locationId)
    const shiftDuration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60))
    const isPastShift = new Date(shift.startTime) < new Date()
    const canCancel = new Date(shift.startTime) - new Date() > 24 * 60 * 60 * 1000
    
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {location?.name || 'Unknown Location'}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {location?.address}
                  </p>
                </div>
              </div>
              <Badge className={`text-xs ${getStatusColor(shift.status)}`}>
                {shift.status}
              </Badge>
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">
                  {isToday(shift.startTime) ? 'Today' :
                   isTomorrow(shift.startTime) ? 'Tomorrow' :
                   formatDate(shift.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">{shiftDuration.toFixed(1)}h</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </span>
              </div>
              {shift.assignedTo && (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 truncate">
                    {shift.assignedTo.firstName} {shift.assignedTo.lastName}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {shift.description && (
              <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                {shift.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isUserShift ? (
                <Button
                  onClick={() => handleCancelShift(shift._id)}
                  disabled={!canCancel}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {canCancel ? 'Cancel' : 'Cannot Cancel'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleBookShift(shift._id)}
                  size="sm"
                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Book Shift
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
            <p className="text-gray-600">Browse and manage your work assignments</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Status Filter (only for my shifts) */}
            {activeTab === 'my-shifts' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Locations</option>
              {getUniqueLocations().map(location => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setLocationFilter('all')
              }}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Available Shifts ({getFilteredShifts(availableShifts).length})
          </TabsTrigger>
          <TabsTrigger value="my-shifts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Shifts ({getFilteredShifts(userShifts).length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          <div className="space-y-4">
            {getFilteredShifts(availableShifts).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredShifts(availableShifts).map((shift) => (
                  <ShiftCard key={shift._id} shift={shift} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Shifts</h3>
                  <p className="text-gray-600">
                    {searchTerm || locationFilter !== 'all'
                      ? "No shifts match your current filters."
                      : "No shifts are currently available for booking."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-shifts" className="mt-6">
          <div className="space-y-4">
            {getFilteredShifts(userShifts).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredShifts(userShifts).map((shift) => (
                  <ShiftCard key={shift._id} shift={shift} isUserShift />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Shifts</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                      ? "No assigned shifts match your current filters."
                      : "You don't have any assigned shifts yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 