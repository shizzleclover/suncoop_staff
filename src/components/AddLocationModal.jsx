import { useState, useEffect } from 'react'
import { MapPin, Building2, Phone, Mail, Clock, User } from 'lucide-react'
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
    coordinates: {
      latitude: '',
      longitude: ''
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

    // Validate coordinates if provided
    if (formData.coordinates.latitude && (isNaN(formData.coordinates.latitude) || formData.coordinates.latitude < -90 || formData.coordinates.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    if (formData.coordinates.longitude && (isNaN(formData.coordinates.longitude) || formData.coordinates.longitude < -180 || formData.coordinates.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
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
        coordinates: formData.coordinates.latitude && formData.coordinates.longitude ? {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude)
        } : undefined,
        facilities: formData.facilities.filter(f => f.trim() !== ''),
        manager: formData.manager && formData.manager !== 'none' ? formData.manager : undefined
      }
      
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
      coordinates: {
        latitude: '',
        longitude: ''
      },
      facilities: [],
      notes: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Location
          </DialogTitle>
          <DialogDescription>
            Add a new work location to your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Downtown Office"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
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
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
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
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude (Optional)</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.latitude}
                  onChange={(e) => handleInputChange('coordinates.latitude', e.target.value)}
                  placeholder="40.7128"
                  className={errors.latitude ? 'border-red-500' : ''}
                />
                {errors.latitude && <p className="text-xs text-red-500">{errors.latitude}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude (Optional)</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.longitude}
                  onChange={(e) => handleInputChange('coordinates.longitude', e.target.value)}
                  placeholder="-74.0060"
                  className={errors.longitude ? 'border-red-500' : ''}
                />
                {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
              </div>
            </div>
          </div>

          {/* Management & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Management & Contact
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location Manager (Optional)</label>
                <Select 
                  value={formData.manager} 
                  onValueChange={(value) => handleInputChange('manager', value)}
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
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
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && <p className="text-xs text-red-500">{errors.contactPhone}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="location@company.com"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail}</p>}
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Operating Hours
            </h3>
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{day.label}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!formData.operatingHours[day.key].isClosed}
                      onChange={(e) => handleOperatingHoursChange(day.key, 'isClosed', !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Open</span>
                  </div>
                  {!formData.operatingHours[day.key].isClosed && (
                    <>
                      <Input
                        type="time"
                        value={formData.operatingHours[day.key].open}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm">to</span>
                      <Input
                        type="time"
                        value={formData.operatingHours[day.key].close}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  {formData.operatingHours[day.key].isClosed && (
                    <span className="text-sm text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Additional Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this location..."
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 