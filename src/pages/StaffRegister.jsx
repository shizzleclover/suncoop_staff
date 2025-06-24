import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useToast } from '../hooks/use-toast'
import { authApi } from '../lib/api'
import { UserPlus, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function StaffRegister() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/staff'} replace />
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
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
      newErrors.password = 'Password must be at least 6 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Optional username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long'
    }

    // Optional phone validation
    if (formData.phone && !/^[\+]?[\d\s\-\(\)\.]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    } else if (formData.phone && (formData.phone.length < 8 || formData.phone.length > 25)) {
      newErrors.phone = 'Phone number must be between 8 and 25 characters'
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
      
      // Clean up form data - remove empty optional fields
      const cleanedFormData = { ...formData }
      if (!cleanedFormData.username?.trim()) {
        delete cleanedFormData.username
      }
      if (!cleanedFormData.phone?.trim()) {
        delete cleanedFormData.phone
      }
      if (!cleanedFormData.department?.trim()) {
        delete cleanedFormData.department
      }
      
      console.log('Submitting registration form with data:', cleanedFormData)
      const response = await authApi.staffRegister(cleanedFormData)
      
      if (response.success) {
        setRegistrationSuccess(true)
        toast({
          title: "Registration Successful!",
          description: "Your account is pending approval by an administrator.",
        })
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle validation errors
      if (error.data?.error?.details) {
        const validationErrors = {}
        error.data.error.details.forEach(detail => {
          validationErrors[detail.field] = detail.message
        })
        setErrors(validationErrors)
        
        toast({
          title: "Registration Failed",
          description: "Please check the form for errors and try again.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "Please try again.",
          variant: "destructive"
        })
      }
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) return { strength: score, text: 'Weak', color: 'text-red-500' }
    if (score <= 3) return { strength: score, text: 'Fair', color: 'text-yellow-500' }
    if (score <= 4) return { strength: score, text: 'Good', color: 'text-blue-500' }
    return { strength: score, text: 'Strong', color: 'text-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Registration Successful!</CardTitle>
            <CardDescription className="text-gray-600">
              Your staff registration request has been submitted and is pending approval by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• An administrator will review your registration request</li>
                    <li>• You'll receive a notification once your account is approved</li>
                    <li>• You can then log in and start using the system</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Join SunCoop</CardTitle>
          <CardDescription className="text-gray-600">
            Register as a staff member to request access to the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john.doe@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Username (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username (Optional)
              </label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="johndoe"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  className={`pr-12 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength <= 2 ? 'bg-red-500' :
                        passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className={`pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Department (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Department (Optional)
              </label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Customer Service, Sales"
                className={errors.department ? 'border-red-500' : ''}
              />
              {errors.department && (
                <p className="text-xs text-red-500">{errors.department}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register for Access'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 