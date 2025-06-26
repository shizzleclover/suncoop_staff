import { useState, useEffect } from 'react'
import { MapPin, Building2, Phone, Mail, Clock, User, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { useToast } from '../hooks/use-toast'
import { locationsApi, usersApi } from '../lib/api'

export default function AddLocationModal({ isOpen, onClose, onLocationAdded }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    type: '',
    capacity: 1,
    manager: 'none',
    contactPhone: '',
    contactEmail: '',
    description: '',
    timezone: 'UTC',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', isClosed: false },
      tuesday: { open: '09:00', close: '17:00', isClosed: false },
      wednesday: { open: '09:00', close: '17:00', isClosed: false },
      thursday: { open: '09:00', close: '17:00', isClosed: false },
      friday: { open: '09:00', close: '17:00', isClosed: false },
      saturday: { open: '09:00', close: '17:00', isClosed: true },
      sunday: { open: '09:00', close: '17:00', isClosed: true }
    },
    facilities: [],
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const locationTypes = [
    { value: 'Office', label: 'Office' },
    { value: 'Branch', label: 'Branch' },
    { value: 'Retail', label: 'Retail Store' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Warehouse', label: 'Warehouse' },
    { value: 'Remote', label: 'Remote Site' }
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' }
  ]

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await usersApi.getUsers({ limit: 100, isActive: true })
      
      if (response.success && response.data.users) {
        setUsers(response.data.users)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.type) {
      newErrors.type = 'Location type is required'
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    if (formData.contactPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      
      // Prepare data for API
      const locationData = {
        ...formData,
        facilities: formData.facilities.filter(f => f.trim() !== ''),
        manager: formData.manager && formData.manager !== 'none' ? formData.manager : undefined,
        // Clean up empty string values that could cause validation issues
        contactPhone: formData.contactPhone.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        description: formData.description.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        state: formData.state.trim() || undefined,
        zipCode: formData.zipCode.trim() || undefined
      }
      
      // Remove undefined values to avoid sending them to the backend
      Object.keys(locationData).forEach(key => {
        if (locationData[key] === undefined) {
          delete locationData[key]
        }
      })
      
      console.log('Sending location data:', locationData) // Debug log
      
      const response = await locationsApi.createLocation(locationData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Location added successfully",
        })
        
        onLocationAdded(response.data.location)
        handleClose()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add location",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating location:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add location",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleFacilitiesChange = (value) => {
    const facilities = value.split(',').map(f => f.trim()).filter(f => f !== '')
    setFormData(prev => ({
      ...prev,
      facilities
    }))
  }



  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      type: '',
      capacity: 1,
      manager: 'none',
      contactPhone: '',
      contactEmail: '',
      description: '',
      timezone: 'UTC',
      operatingHours: {
        monday: { open: '09:00', close: '17:00', isClosed: false },
        tuesday: { open: '09:00', close: '17:00', isClosed: false },
        wednesday: { open: '09:00', close: '17:00', isClosed: false },
        thursday: { open: '09:00', close: '17:00', isClosed: false },
        friday: { open: '09:00', close: '17:00', isClosed: false },
        saturday: { open: '09:00', close: '17:00', isClosed: true },
        sunday: { open: '09:00', close: '17:00', isClosed: true }
      },
      facilities: [],
      notes: '',

    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 mx-2 sm:mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="h-5 w-5" />
            Add New Location
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add a new work location to your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Downtown Office"
                  className={`text-base ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className={`text-base ${errors.type ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the location"
                className="text-base"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Street Address <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
                className={`text-base ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className={`text-base ${errors.city ? 'border-red-500' : ''}`}
                />
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                  className="text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="12345"
                  className="text-base"
                />
              </div>
            </div>
          </div>

          {/* Management & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <User className="h-4 w-4" />
              Management & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location Manager (Optional)</label>
                <Select 
                  value={formData.manager} 
                  onValueChange={(value) => handleInputChange('manager', value)}
                  disabled={loadingUsers}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                  className={`text-base ${errors.capacity ? 'border-red-500' : ''}`}
                />
                {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`text-base ${errors.contactPhone ? 'border-red-500' : ''}`}
                />
                {errors.contactPhone && <p className="text-xs text-red-500">{errors.contactPhone}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="location@company.com"
                  className={`text-base ${errors.contactEmail ? 'border-red-500' : ''}`}
                />
                {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail}</p>}
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Clock className="h-4 w-4" />
              Operating Hours
            </h3>
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-full sm:w-20 text-sm font-medium">{day.label}</div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!formData.operatingHours[day.key].isClosed}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'isClosed', !e.target.checked)}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm">Open</span>
                    </div>
                    {!formData.operatingHours[day.key].isClosed && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input
                          type="time"
                          value={formData.operatingHours[day.key].open}
                          onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                          className="w-28 text-sm"
                        />
                        <span className="text-sm">to</span>
                        <Input
                          type="time"
                          value={formData.operatingHours[day.key].close}
                          onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                          className="w-28 text-sm"
                        />
                      </div>
                    )}
                    {formData.operatingHours[day.key].isClosed && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Additional Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Facilities</label>
                <Input
                  value={formData.facilities.join(', ')}
                  onChange={(e) => handleFacilitiesChange(e.target.value)}
                  placeholder="WiFi, Parking, Cafeteria (comma separated)"
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this location..."
                className="text-base"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="w-full sm:w-auto text-base py-3"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full sm:w-auto text-base py-3"
          >
            {isSubmitting ? 'Adding...' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 