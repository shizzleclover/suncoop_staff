import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PasswordReset() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { requestPasswordReset, resetPassword, isLoading } = useAuthStore()
  
  const token = searchParams.get('token')
  const isResetMode = !!token

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!isResetMode) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    } else {
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
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

    if (isResetMode) {
      // Reset password with token
      const result = await resetPassword(token, formData.newPassword, formData.confirmPassword)
      
      if (result.success) {
        setSuccess(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to reset password')
      }
    } else {
      // Request password reset
      const result = await requestPasswordReset(formData.email)
      
      if (result.success) {
        setSuccess(true)
        // For demo purposes, show the reset token
        if (result.resetToken) {
          toast.success(`Reset link generated! Token: ${result.resetToken}`)
        }
      } else {
        toast.error(result.error || 'Failed to send reset email')
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (success && !isResetMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (success && isResetMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          {isResetMode ? (
            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          ) : (
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isResetMode ? 'Reset Your Password' : 'Forgot Password?'}
          </h1>
          <p className="text-gray-600">
            {isResetMode 
              ? 'Enter your new password below'
              : 'Enter your email address and we\'ll send you a reset link'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isResetMode ? (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.newPassword && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.newPassword}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading 
              ? (isResetMode ? 'Resetting...' : 'Sending...') 
              : (isResetMode ? 'Reset Password' : 'Send Reset Email')
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Login
          </button>
        </div>

        {/* Demo Information */}
        {!isResetMode && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Demo Mode</p>
                <p>In demo mode, the reset token will be displayed in the success message.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 