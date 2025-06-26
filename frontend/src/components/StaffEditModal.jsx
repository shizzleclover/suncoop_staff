import { useState, useEffect } from 'react'
import { Save, X, User, Mail, Phone, Building, Hash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { useToast } from '../hooks/use-toast'
import { usersApi } from '../lib/api'
import { LoadingSpinner } from './LoadingSpinner'

export default function StaffEditModal({ isOpen, onClose, staffMember, onStaffUpdated }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    organizationType: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (staffMember) {
      setFormData({
        firstName: staffMember.firstName || '',
        lastName: staffMember.lastName || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        department: staffMember.department || '',
        employeeId: staffMember.employeeId || '',
        organizationType: staffMember.organizationType || ''
      })
      setErrors({})
    }
  }, [staffMember])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^[\+]?[\d\s\-\(\)\.]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
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
      setLoading(true)

      // Clean form data - remove empty optional fields
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value.trim()
        }
        return acc
      }, {})

      const response = await usersApi.updateUser(staffMember._id, cleanedData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })

        onStaffUpdated(response.data.user)
        onClose()
      } else {
        if (response.errors && Array.isArray(response.errors)) {
          const fieldErrors = {}
          response.errors.forEach(error => {
            if (error.path) {
              fieldErrors[error.path] = error.msg
            }
          })
          setErrors(fieldErrors)
        }

        toast({
          title: "Error",
          description: response.message || "Failed to update staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating staff:', error)
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setErrors({})
    }
  }

  if (!staffMember) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Staff Member
          </DialogTitle>
          <DialogDescription>
            Update {staffMember.firstName} {staffMember.lastName}'s information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className={errors.firstName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className={errors.lastName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number (optional)"
              className={errors.phone ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="employeeId" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Employee ID
              </Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                placeholder="Enter employee ID"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="organizationType">Organization Type</Label>
            <Input
              id="organizationType"
              value={formData.organizationType}
              onChange={(e) => handleInputChange('organizationType', e.target.value)}
              placeholder="Enter organization type"
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 