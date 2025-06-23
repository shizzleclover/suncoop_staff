import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Phone, MapPin, Shield, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { useToast } from '../hooks/use-toast'
import { usersApi } from '../lib/api'

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'staff',
    department: '',
    isActive: true
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const roles = [
    { value: 'staff', label: 'Staff Member' },
    { value: 'admin', label: 'Administrator' }
  ]

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

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Updated phone number validation to support formats like 090, +234, etc.
    if (formData.phone && formData.phone.trim()) {
      const phone = formData.phone.trim()
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '')
      
      // More flexible phone validation
      // Supports: 090xxxxxxxx, +234xxxxxxxxx, 234xxxxxxxxx, international formats
      const isNigerianFormat = /^(0?[789]\d{9})$/.test(cleanPhone) || /^(234[789]\d{9})$/.test(cleanPhone)
      const isInternationalFormat = /^\d{7,15}$/.test(cleanPhone)
      
      if (!isNigerianFormat && !isInternationalFormat) {
        newErrors.phone = 'Please enter a valid phone number (e.g., 09012345678, +2349012345678)'
      }
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
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        username: formData.username.trim() || undefined,
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        department: formData.department.trim() || undefined,
        isActive: formData.isActive
      }
      
      const response = await usersApi.createUser(userData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: `${formData.firstName} ${formData.lastName} has been created successfully`,
        })
        
        onUserAdded(response.data.user)
        handleClose()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'staff',
      department: '',
      isActive: true
    })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const levels = [
      { text: 'Very Weak', color: 'text-red-500' },
      { text: 'Weak', color: 'text-orange-500' },
      { text: 'Fair', color: 'text-yellow-500' },
      { text: 'Good', color: 'text-blue-500' },
      { text: 'Strong', color: 'text-green-500' }
    ]
    
    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account. Set their password and details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Username (Optional)</label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.text}
                  </p>
                )}
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Contact & Role */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact & Role
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., 09012345678, +2349012345678"
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                <p className="text-xs text-gray-500">
                  Supports formats: 09012345678, +2349012345678, 2349012345678, etc.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department (Optional)</label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Sales, Marketing, Operations"
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 