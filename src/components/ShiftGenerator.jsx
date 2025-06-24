import { useState } from 'react'
import { Calendar, Clock, Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useToast } from '../hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { shiftsApi } from '../lib/api'

export default function ShiftGenerator({ isOpen, onClose, locations, onShiftsGenerated }) {
  const { toast } = useToast()
  const [locationId, setLocationId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [shiftDuration, setShiftDuration] = useState(8)
  const [breakBetweenShifts, setBreakBetweenShifts] = useState(1)
  const [daysOfWeek, setDaysOfWeek] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewShifts, setPreviewShifts] = useState([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Handle day of week toggle
  const toggleDay = (day) => {
    setDaysOfWeek(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  // Generate preview of shifts
  const generatePreview = () => {
    if (!validateForm()) return

    const shifts = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    console.log('Generating shifts:', { startDate, endDate, startTime, endTime, shiftDuration, breakBetweenShifts, daysOfWeek })
    
    // Loop through each day in the date range
    const currentDay = new Date(start)
    while (currentDay <= end) {
      const dayOfWeek = currentDay.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      console.log('Processing day:', currentDay.toDateString(), 'dayOfWeek:', dayOfWeek, 'selected:', daysOfWeek[dayOfWeek])
      
      // Skip days that are not selected
      if (daysOfWeek[dayOfWeek]) {
        // Parse start and end times
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)
        
        // Calculate the total working period in minutes
        const workingStartMinutes = startHour * 60 + startMinute
        const workingEndMinutes = endHour * 60 + endMinute
        const totalWorkingMinutes = workingEndMinutes - workingStartMinutes
        
        // Calculate shift duration and break in minutes
        const shiftDurationMinutes = shiftDuration * 60
        const breakMinutes = breakBetweenShifts * 60
        
        console.log('Working period:', { totalWorkingMinutes, shiftDurationMinutes, breakMinutes })
        
        // Calculate how many shifts can fit in the working period
        // We need at least one shift duration, and then additional shifts need duration + break
        let currentMinute = 0
        let shiftCount = 0
        
        while (currentMinute + shiftDurationMinutes <= totalWorkingMinutes) {
          const shiftStart = new Date(currentDay)
          shiftStart.setHours(0, 0, 0, 0) // Reset to start of day
          shiftStart.setMinutes(workingStartMinutes + currentMinute)
          
          const shiftEnd = new Date(shiftStart)
          shiftEnd.setMinutes(shiftEnd.getMinutes() + shiftDurationMinutes)
          
          shifts.push({
            locationId,
            startTime: shiftStart,
            endTime: shiftEnd,
            status: 'AVAILABLE',
            description: `Auto-generated shift`
          })
          
          shiftCount++
          console.log(`Added shift ${shiftCount}:`, shiftStart.toLocaleString(), '-', shiftEnd.toLocaleString())
          
          // Move to next shift start time (current shift end + break)
          currentMinute += shiftDurationMinutes + breakMinutes
        }
        
        console.log(`Generated ${shiftCount} shifts for ${currentDay.toDateString()}`)
      }
      
      // Move to next day
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    console.log('Total shifts generated:', shifts.length)
    setPreviewShifts(shifts)
    setIsPreviewMode(true)
  }

  // Validate the form
  const validateForm = () => {
    console.log('Validating form:', { locationId, startDate, endDate, startTime, endTime, daysOfWeek })
    
    if (!locationId) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      })
      return false
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      })
      return false
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive"
      })
      return false
    }
    
    if (!startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please specify both start and end times",
        variant: "destructive"
      })
      return false
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    
    if (startMinutes >= endMinutes) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      })
      return false
    }
    
    // Check if any day is selected
    if (!Object.values(daysOfWeek).some(day => day)) {
      toast({
        title: "Error",
        description: "Please select at least one day of the week",
        variant: "destructive"
      })
      return false
    }
    
    // Check if shift duration is reasonable
    const totalWorkingMinutes = endMinutes - startMinutes
    const shiftDurationMinutes = shiftDuration * 60
    
    if (shiftDurationMinutes > totalWorkingMinutes) {
      toast({
        title: "Error",
        description: "Shift duration cannot be longer than the working period",
        variant: "destructive"
      })
      return false
    }
    
    console.log('Form validation passed')
    return true
  }

  // Handle shift generation
  const handleGenerateShifts = async () => {
    try {
      setIsGenerating(true)
      
      // Create all shifts
      const createdShifts = []
      
      for (const shift of previewShifts) {
        try {
          const response = await shiftsApi.createShift({
            locationId: shift.locationId,
            startTime: shift.startTime,
            endTime: shift.endTime,
            status: 'AVAILABLE',
            description: `Auto-generated shift`
          })
          
          if (response.success) {
            createdShifts.push(response.data.shift)
          }
        } catch (error) {
          console.error('Failed to create shift:', error)
        }
      }
      
      toast({
        title: "Success",
        description: `Generated ${createdShifts.length} shifts successfully`,
      })
      
      // Close modal and refresh parent
      onShiftsGenerated(createdShifts)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate shifts",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get location name by ID
  const getLocationName = (id) => {
    const location = locations?.find(loc => loc._id === id)
    return location ? location.name : 'Unknown Location'
  }

  // Reset form
  const resetForm = () => {
    setLocationId('')
    setStartDate('')
    setEndDate('')
    setStartTime('09:00')
    setEndTime('17:00')
    setShiftDuration(8)
    setBreakBetweenShifts(1)
    setDaysOfWeek({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    })
    setPreviewShifts([])
    setIsPreviewMode(false)
  }

  // Handle modal close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  const dayLabels = {
    monday: 'Mon',
    tuesday: 'Tue', 
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bulk Shift Generator
          </DialogTitle>
          <DialogDescription>
            Generate multiple shifts automatically based on your schedule parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isPreviewMode ? (
            <>
              {/* Location Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Working Hours Start</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Working Hours End</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Shift Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shift Duration (hours)</label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={shiftDuration}
                    onChange={(e) => setShiftDuration(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Break Between Shifts (hours)</label>
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    value={breakBetweenShifts}
                    onChange={(e) => setBreakBetweenShifts(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dayLabels).map(([day, label]) => (
                    <Button
                      key={day}
                      type="button"
                      variant={daysOfWeek[day] ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                      className="min-w-[50px]"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview Button */}
              <Button 
                onClick={generatePreview} 
                className="w-full"
                type="button"
              >
                <Clock className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>
            </>
          ) : (
            <>
              {/* Preview Mode */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Shift Preview</h3>
                  <div className="text-sm text-gray-600">
                    {previewShifts.length} shifts will be created
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Location:</strong> {getLocationName(locationId)}
                  <br />
                  <strong>Period:</strong> {formatDate(startDate)} - {formatDate(endDate)}
                  <br />
                  <strong>Working Hours:</strong> {startTime} - {endTime}
                  <br />
                  <strong>Shift Duration:</strong> {shiftDuration} hours
                </div>

                {/* Preview List */}
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {previewShifts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No shifts generated with current parameters
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {previewShifts.map((shift, index) => (
                        <div key={index} className="flex justify-between items-center p-2 text-sm border-b">
                          <span>
                            {formatDate(shift.startTime)}
                          </span>
                          <span>
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {isPreviewMode ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewMode(false)}
              >
                Back to Edit
              </Button>
              <Button 
                onClick={handleGenerateShifts}
                disabled={isGenerating || previewShifts.length === 0}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate {previewShifts.length} Shifts
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={generatePreview} disabled={!locationId || !startDate || !endDate}>
              Preview Shifts
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 