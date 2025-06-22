import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { mockShifts, getLocationById } from '../../data/mockData'
import { formatTime, formatDate, SHIFT_STATUS } from '../../lib/utils'
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
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffShifts() {
  const { user } = useAuthStore()
  const [shifts, setShifts] = useState([])
  const [userShifts, setUserShifts] = useState([])
  const [selectedTab, setSelectedTab] = useState('available')
  const [locationFilter, setLocationFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadShifts()
  }, [user?.id])

  const loadShifts = () => {
    if (!user?.id) return

    // Get all shifts
    const allShifts = mockShifts
    
    // Filter available shifts (not booked by anyone and still open)
    const availableShifts = allShifts.filter(shift => 
      shift.status === SHIFT_STATUS.AVAILABLE && 
      !shift.assignedTo && 
      new Date(shift.startTime) > new Date() // Only future shifts
    )
    
    // Get user's booked shifts
    const myShifts = allShifts.filter(shift => 
      shift.assignedTo === user.id
    )
    
    setShifts(availableShifts)
    setUserShifts(myShifts)
  }

  const getFilteredShifts = (shiftList) => {
    let filtered = shiftList

    if (locationFilter !== 'all') {
      filtered = filtered.filter(shift => shift.locationId === locationFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter(shift => 
        new Date(shift.startTime).toDateString() === new Date(dateFilter).toDateString()
      )
    }

    return filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }

  const handleBookShift = async (shiftId) => {
    try {
      // In a real app, this would be an API call
      setShifts(prev => prev.filter(shift => shift.id !== shiftId))
      setUserShifts(prev => [...prev, { 
        ...mockShifts.find(s => s.id === shiftId),
        assignedTo: user.id,
        status: SHIFT_STATUS.BOOKED
      }])
      
      toast.success('Shift booked successfully')
    } catch (error) {
      toast.error('Failed to book shift')
    }
  }

  const handleCancelShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to cancel this shift? This action cannot be undone.')) {
      return
    }

    try {
      // In a real app, this would be an API call
      const shift = userShifts.find(s => s.id === shiftId)
      if (shift) {
        setUserShifts(prev => prev.filter(shift => shift.id !== shiftId))
        setShifts(prev => [...prev, { 
          ...shift,
          assignedTo: null,
          status: SHIFT_STATUS.AVAILABLE
        }])
      }
      
      toast.success('Shift cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel shift')
    }
  }

  const getUniqueLocations = () => {
    const allShifts = [...shifts, ...userShifts]
    const locationIds = [...new Set(allShifts.map(s => s && s.locationId).filter(Boolean))]
    return locationIds.map(id => getLocationById(id)).filter(Boolean)
  }

  const ShiftCard = ({ shift, isUserShift = false }) => {
    const location = getLocationById(shift.locationId)
    const shiftDuration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60))
    const isPastShift = new Date(shift.startTime) < new Date()
    
    return (
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">{location?.name || 'Unknown Location'}</CardTitle>
                <p className="text-sm text-gray-500">{location?.address}</p>
              </div>
            </div>
            <Badge variant={isUserShift ? "default" : "secondary"} className="text-xs font-medium">
              {isUserShift ? 'Assigned' : 'Available'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{formatDate(shift.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{shiftDuration.toFixed(1)}h</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              
              <div className="flex gap-2">
                {isUserShift ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelShift(shift.id)}
                    disabled={isPastShift}
                    className="text-xs"
                  >
                    {isPastShift ? 'Completed' : 'Cancel'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleBookShift(shift.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                  >
                    Book Shift
                  </Button>
                )}
              </div>
            </div>
            
            {shift.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">{shift.description}</p>
              </div>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                {getUniqueLocations().map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setLocationFilter('all')
                  setDateFilter('')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Available Shifts ({getFilteredShifts(shifts).length})
          </TabsTrigger>
          <TabsTrigger value="my-shifts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Shifts ({getFilteredShifts(userShifts).length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          <div className="space-y-4">
            {getFilteredShifts(shifts).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredShifts(shifts).map((shift) => (
                  <ShiftCard key={shift.id} shift={shift} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Shifts</h3>
                  <p className="text-gray-600">
                    {locationFilter !== 'all' || dateFilter
                      ? "No shifts match your current filters."
                      : "There are no available shifts at this time."}
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
                  <ShiftCard key={shift.id} shift={shift} isUserShift />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Shifts</h3>
                  <p className="text-gray-600">
                    {locationFilter !== 'all' || dateFilter
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