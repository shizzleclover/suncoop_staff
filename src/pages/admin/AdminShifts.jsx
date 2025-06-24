import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, Users, Filter, Search, MoreHorizontal, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { useToast } from '../../hooks/use-toast'
import { formatTime, formatDate, formatDateShort } from '../../lib/utils'
import { shiftsApi, locationsApi } from '../../lib/api'
import ShiftGenerator from '../../components/ShiftGenerator'

export default function AdminShifts() {
  const { toast } = useToast()
  const [shifts, setShifts] = useState([])
  const [locations, setLocations] = useState([])
  const [filteredShifts, setFilteredShifts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterShifts()
  }, [shifts, searchTerm, filterStatus, filterLocation, filterDate])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load both shifts and locations in parallel
      const [shiftsResponse, locationsResponse] = await Promise.all([
        shiftsApi.getShifts({
          limit: 100,
          sortBy: 'startTime',
          sortOrder: 'desc'
        }),
        locationsApi.getActiveLocations()
      ])

      if (shiftsResponse.success) {
        setShifts(shiftsResponse.data.shifts || [])
      }

      if (locationsResponse.success) {
        setLocations(locationsResponse.data.locations || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: "Error",
        description: "Failed to load shifts data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterShifts = () => {
    let filtered = [...shifts]

    if (searchTerm) {
      filtered = filtered.filter(shift => 
        shift.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocationById(shift.locationId._id || shift.locationId)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(shift => shift.status === filterStatus)
    }

    if (filterLocation && filterLocation !== 'all') {
      filtered = filtered.filter(shift => 
        (shift.locationId._id || shift.locationId) === filterLocation
      )
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate).toDateString()
      filtered = filtered.filter(shift => 
        new Date(shift.startTime).toDateString() === selectedDate
      )
    }

    setFilteredShifts(filtered)
  }

  const getLocationById = (locationId) => {
    return locations.find(location => location._id === locationId)
  }

  const handleDeleteShift = async (shiftId) => {
    try {
      await shiftsApi.deleteShift(shiftId)
      toast({
        title: "Success",
        description: "Shift deleted successfully",
      })
      loadData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800'
      case 'BOOKED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Handle shifts generated from the bulk generator
  const handleShiftsGenerated = (newShifts) => {
    toast({
      title: "Success",
      description: `${newShifts.length} shifts generated successfully`,
    })
    loadData() // Refresh the shifts list
  }

  // Handle clearing all shifts
  const handleClearAllShifts = async () => {
    if (confirmText !== 'DELETE ALL SHIFTS') {
      toast({
        title: "Error",
        description: "Please type 'DELETE ALL SHIFTS' to confirm",
        variant: "destructive",
      })
      return
    }

    setIsClearing(true)
    try {
      await shiftsApi.clearAllShifts(confirmText)
      toast({
        title: "Success",
        description: "All shifts have been cleared successfully",
      })
      setShowClearAllDialog(false)
      setConfirmText('')
      loadData() // Refresh the shifts list
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear shifts",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
            <p className="text-gray-600">Create, assign, and manage work shifts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowClearAllDialog(true)}
              disabled={shifts.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Shifts
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowGeneratorModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Shifts
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Filter by date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                    setFilterLocation('all')
                    setFilterDate('')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shifts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>All Shifts ({filteredShifts.length})</span>
            </CardTitle>
            <CardDescription>
              Manage all work shifts and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredShifts.length > 0 ? (
              <div className="space-y-4">
                {filteredShifts.map((shift) => {
                  const location = getLocationById(shift.locationId._id || shift.locationId)
                  const duration = ((new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60)).toFixed(1)
                  
                  return (
                    <div key={shift._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {formatDateShort(shift.startTime)}
                            </h3>
                            <Badge className={getStatusColor(shift.status)}>
                              {shift.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)} ({duration}h)
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {location?.name || 'Unknown Location'}
                          </p>
                          {shift.description && (
                            <p className="text-xs text-gray-500 mt-1">{shift.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {shift.assignedTo && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {shift.assignedTo.firstName} {shift.assignedTo.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{shift.assignedTo.email}</p>
                          </div>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Shift
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteShift(shift._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Shift
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus || filterLocation || filterDate
                    ? "No shifts match your current filters"
                    : "Get started by creating your first shift"
                  }
                </p>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => setShowGeneratorModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Shifts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Shift Generator Modal */}
        {showGeneratorModal && (
          <ShiftGenerator
            isOpen={showGeneratorModal}
            onClose={() => setShowGeneratorModal(false)}
            locations={locations}
            onShiftsGenerated={handleShiftsGenerated}
          />
        )}

        {/* Clear All Shifts Confirmation Dialog */}
        <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Clear All Shifts</span>
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p>
                  <strong>This action will permanently delete ALL shifts:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All available shifts will be removed</li>
                  <li>All booked shifts will be cancelled and removed</li>
                  <li>All completed shifts will be deleted from history</li>
                  <li>Staff assignments will be lost</li>
                </ul>
                <p className="text-red-600 font-medium">
                  This action cannot be undone!
                </p>
                <p>
                  To confirm, type <strong>"DELETE ALL SHIFTS"</strong> below:
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Type: DELETE ALL SHIFTS"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-gray-500">
                Found {shifts.length} shift{shifts.length !== 1 ? 's' : ''} to delete
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowClearAllDialog(false)
                  setConfirmText('')
                }}
                disabled={isClearing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllShifts}
                disabled={isClearing || confirmText !== 'DELETE ALL SHIFTS'}
              >
                {isClearing ? 'Clearing...' : 'Clear All Shifts'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 