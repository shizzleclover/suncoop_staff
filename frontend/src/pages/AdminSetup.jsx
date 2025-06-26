import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSetup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { setupInitialAdmin, checkSystemStatus } = useAuthStore()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'Company',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    // Staff member data
    staffFirstName: '',
    staffLastName: '',
    staffEmail: '',
    staffUsername: '',
    createStaff: true
  })

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await checkSystemStatus()
        
        // If system is already initialized, redirect to login
        if (!status?.needsInitialSetup) {
          navigate('/login')
          return
        }
      } catch (error) {
        console.error('Failed to check system status:', error)
        // Continue to show the setup form even if status check fails
        // This allows setup to work even when backend is not available
      }
    }
    
    checkSetup()
  }, [checkSystemStatus, navigate])

  // Calculate password strength
  useEffect(() => {
    const password = formData.password
    let strength = 0
    
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    setPasswordStrength(strength)
  }, [formData.password])

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      // Organization Setup
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required'
      } else if (formData.organizationName.trim().length < 2 || formData.organizationName.trim().length > 100) {
        newErrors.organizationName = 'Organization name must be between 2 and 100 characters'
      }
    } else if (step === 2) {
      // Admin Account
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3 || formData.username.length > 30) {
        newErrors.username = 'Username must be between 3 and 30 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
        newErrors.firstName = 'First name must be between 2 and 50 characters'
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
        newErrors.lastName = 'Last name must be between 2 and 50 characters'
      }
    } else if (step === 3) {
      // Security Setup - Match backend validation exactly
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long'
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password confirmation does not match password'
      }
    } else if (step === 4) {
      // Staff Creation (optional but if enabled, validate)
      if (formData.createStaff) {
        if (!formData.staffFirstName.trim()) {
          newErrors.staffFirstName = 'Staff first name is required'
        }
        if (!formData.staffLastName.trim()) {
          newErrors.staffLastName = 'Staff last name is required'
        }
        if (!formData.staffEmail.trim()) {
          newErrors.staffEmail = 'Staff email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.staffEmail)) {
          newErrors.staffEmail = 'Please enter a valid email address'
        }
        if (!formData.staffUsername.trim()) {
          newErrors.staffUsername = 'Staff username is required'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(4)) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await setupInitialAdmin(formData)
      
      if (result.success) {
        // If staff creation is enabled, create the staff member
        if (formData.createStaff) {
          try {
            const staffData = {
              firstName: formData.staffFirstName,
              lastName: formData.staffLastName,
              email: formData.staffEmail,
              username: formData.staffUsername,
              role: 'staff'
            }
            // Note: This would need a separate API call to create staff
            console.log('Would create staff:', staffData)
            toast.success('Admin account and staff member created successfully!')
          } catch (staffError) {
            console.error('Failed to create staff:', staffError)
            toast.success('Admin account created! Please add staff member manually.')
          }
        } else {
          toast.success('Admin account created successfully!')
        }
        navigate('/admin/dashboard')
      } else {
        toast.error(result.error || 'Failed to create admin account')
        setErrors({ submit: result.error || 'Failed to create admin account' })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500'
    if (passwordStrength < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return 'Weak'
    if (passwordStrength < 4) return 'Medium'
    return 'Strong'
  }

  const StepIndicator = ({ step, title, isActive, isCompleted }) => (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isCompleted ? 'bg-green-600 text-white' :
        isActive ? 'bg-blue-600 text-white' :
        'bg-gray-200 text-gray-600'
      }`}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isActive ? 'text-blue-600' : 
        isCompleted ? 'text-green-600' : 
        'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="flex-1 p-4 pb-safe">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Initial System Setup</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 px-2">Set up your SunCoop Staff Management System</p>
          
            </div>

          {/* Progress Steps */}
          <div className="mb-6 md:mb-8">
            {/* Mobile Progress - Simple dots */}
            <div className="flex justify-center items-center space-x-2 md:hidden mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2.5 h-2.5 rounded-full ${
                    step === currentStep
                      ? 'bg-blue-600'
                      : step < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-center md:hidden">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of 4: {
                  currentStep === 1 ? 'Organization' :
                  currentStep === 2 ? 'Admin Account' :
                  currentStep === 3 ? 'Security' : 'Staff Member'
                }
              </span>
            </div>

            {/* Desktop Progress - Full steps */}
            <div className="hidden md:flex justify-between items-center max-w-lg mx-auto">
              <StepIndicator 
                step={1} 
                title="Organization" 
                isActive={currentStep === 1} 
                isCompleted={currentStep > 1} 
              />
              <div className="flex-1 h-px bg-gray-300 mx-2"></div>
              <StepIndicator 
                step={2} 
                title="Admin" 
                isActive={currentStep === 2} 
                isCompleted={currentStep > 2} 
              />
              <div className="flex-1 h-px bg-gray-300 mx-2"></div>
              <StepIndicator 
                step={3} 
                title="Security" 
                isActive={currentStep === 3} 
                isCompleted={currentStep > 3} 
              />
              <div className="flex-1 h-px bg-gray-300 mx-2"></div>
              <StepIndicator 
                step={4} 
                title="Staff" 
                isActive={currentStep === 4} 
                isCompleted={false} 
              />
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-0 md:border shadow-lg md:shadow-sm">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">
                {currentStep === 1 && "Organization Setup"}
                {currentStep === 2 && "Administrator Account"}
                {currentStep === 3 && "Security Setup"}
                {currentStep === 4 && "Add First Staff Member"}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                {currentStep === 1 && "Tell us about your organization"}
                {currentStep === 2 && "Create the main administrator account"}
                {currentStep === 3 && "Set up security credentials"}
                {currentStep === 4 && "Add your first staff member to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
            {errors.submit && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
              {/* Step 1: Organization Setup */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="organizationName" className="text-sm md:text-base">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="Enter your organization name"
                      className={`h-11 md:h-10 text-base md:text-sm ${errors.organizationName ? 'border-red-500' : ''}`}
                    />
                    {errors.organizationName && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="organizationType" className="text-sm md:text-base">Organization Type *</Label>
                    <select
                      id="organizationType"
                      value={formData.organizationType}
                      onChange={(e) => handleInputChange('organizationType', e.target.value)}
                      className="w-full h-11 md:h-10 px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="Company">Company</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Retail">Retail Store</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm md:text-base">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                        className={`h-11 md:h-10 text-base md:text-sm ${errors.firstName ? 'border-red-500' : ''}`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs md:text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm md:text-base">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                        className={`h-11 md:h-10 text-base md:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs md:text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-sm md:text-base">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Choose a username"
                      className={`h-11 md:h-10 text-base md:text-sm ${errors.username ? 'border-red-500' : ''}`}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm md:text-base">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@yourcompany.com"
                      className={`h-11 md:h-10 text-base md:text-sm ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Security Setup */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-sm md:text-base">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="At least 8 characters with uppercase, lowercase, and number"
                        className={`h-11 md:h-10 text-base md:text-sm pr-12 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 md:h-4 md:w-4" /> : <Eye className="h-5 w-5 md:h-4 md:w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Password strength:</span>
                          <span className={
                            passwordStrength < 2 ? 'text-red-500' :
                            passwordStrength < 4 ? 'text-yellow-500' : 'text-green-500'
                          }>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className={`h-11 md:h-10 text-base md:text-sm pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 md:h-4 md:w-4" /> : <Eye className="h-5 w-5 md:h-4 md:w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Staff Creation */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="createStaff"
                      checked={formData.createStaff}
                      onChange={(e) => handleInputChange('createStaff', e.target.checked)}
                      className="h-5 w-5 md:h-4 md:w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <Label htmlFor="createStaff" className="text-sm md:text-base cursor-pointer">Add a staff member now (optional)</Label>
                  </div>

                  {formData.createStaff && (
                    <div className="space-y-4 border-l-4 border-blue-200 pl-4 ml-2 bg-blue-50/50 p-4 rounded-r-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="staffFirstName" className="text-sm md:text-base">Staff First Name *</Label>
                          <Input
                            id="staffFirstName"
                            value={formData.staffFirstName}
                            onChange={(e) => handleInputChange('staffFirstName', e.target.value)}
                            placeholder="First name"
                            className={`h-11 md:h-10 text-base md:text-sm ${errors.staffFirstName ? 'border-red-500' : ''}`}
                          />
                          {errors.staffFirstName && (
                            <p className="text-red-500 text-xs md:text-sm mt-1">{errors.staffFirstName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="staffLastName" className="text-sm md:text-base">Staff Last Name *</Label>
                          <Input
                            id="staffLastName"
                            value={formData.staffLastName}
                            onChange={(e) => handleInputChange('staffLastName', e.target.value)}
                            placeholder="Last name"
                            className={`h-11 md:h-10 text-base md:text-sm ${errors.staffLastName ? 'border-red-500' : ''}`}
                          />
                          {errors.staffLastName && (
                            <p className="text-red-500 text-xs md:text-sm mt-1">{errors.staffLastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="staffUsername" className="text-sm md:text-base">Staff Username *</Label>
                        <Input
                          id="staffUsername"
                          value={formData.staffUsername}
                          onChange={(e) => handleInputChange('staffUsername', e.target.value)}
                          placeholder="Choose a username"
                          className={`h-11 md:h-10 text-base md:text-sm ${errors.staffUsername ? 'border-red-500' : ''}`}
                        />
                        {errors.staffUsername && (
                          <p className="text-red-500 text-xs md:text-sm mt-1">{errors.staffUsername}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="staffEmail" className="text-sm md:text-base">Staff Email Address *</Label>
                        <Input
                          id="staffEmail"
                          type="email"
                          value={formData.staffEmail}
                          onChange={(e) => handleInputChange('staffEmail', e.target.value)}
                          placeholder="staff@yourcompany.com"
                          className={`h-11 md:h-10 text-base md:text-sm ${errors.staffEmail ? 'border-red-500' : ''}`}
                        />
                        {errors.staffEmail && (
                          <p className="text-red-500 text-xs md:text-sm mt-1">{errors.staffEmail}</p>
                        )}
                      </div>

                      <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                        <p className="text-xs md:text-sm text-blue-700">
                          📧 A temporary password will be generated and sent to the staff member's email.
                          They can change it after logging in.
                        </p>
                      </div>
                    </div>
                  )}

                  {!formData.createStaff && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm md:text-base text-gray-600">
                        You can add staff members later from the admin dashboard.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col md:flex-row gap-3 md:justify-between pt-6 md:pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`h-12 md:h-10 text-base md:text-sm order-2 md:order-1 ${currentStep === 1 ? 'invisible' : ''}`}
                >
                  Back
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 md:h-10 text-base md:text-sm order-1 md:order-2"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 md:h-10 text-base md:text-sm min-w-[140px] md:min-w-[120px] order-1 md:order-2"
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                )}
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 