import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Camera,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { useAuthStore } from '../../store'
import { usersApi, timeTrackingApi, shiftsApi } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address')
})

export default function StaffProfile() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuthStore()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalShifts: 0,
    totalHours: 0,
    averageShiftLength: 0,
    averageRating: 0,
    joinedDate: user?.joinedAt || user?.createdAt
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || ''
    }
  })

  // Load user statistics from API (profile data comes from auth store)
  useEffect(() => {
    const loadUserProfile = () => {
      if (user) {
        console.log('User data available, updating form:', user)
        
        // Update form with user data from store
        reset({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          email: user.email || ''
        })
        setProfileLoading(false)
      }
    }

    const loadUserStats = async () => {
      try {
        setStatsLoading(true)
        
        // Get time summary for current user
        const timeResponse = await timeTrackingApi.getTimeSummary({ 
          userId: user?._id || user?.id,
          period: 'all' 
        })
        
        // Get user shifts for shift count
        const shiftsResponse = await shiftsApi.getUserShifts({ 
          status: 'completed' 
        })
        
        if (timeResponse.success && shiftsResponse.success) {
          const timeData = timeResponse.data
          const shiftsData = shiftsResponse.data
          
          setStats({
            totalShifts: shiftsData.shifts?.length || 0,
            totalHours: timeData.totalHours || 0,
            averageShiftLength: timeData.averageShiftLength || 0,
            averageRating: timeData.averageRating || 0,
            joinedDate: user?.joinedAt || user?.createdAt
          })
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
        toast({
          title: "Error",
          description: "Failed to load work statistics",
          variant: "destructive"
        })
      } finally {
        setStatsLoading(false)
      }
    }

    // Only load data if user is available and authenticated
    if (isAuthenticated && user && (user._id || user.id)) {
      loadUserProfile()
      loadUserStats()
    } else if (!authLoading) {
      // If no user and auth is not loading, set loading to false
      setProfileLoading(false)
      setStatsLoading(false)
    }
  }, [user, isAuthenticated, authLoading, toast, reset])

  // Debug user data
  console.log('Current user in store:', user)
  console.log('Is authenticated:', isAuthenticated)
  console.log('Auth loading:', authLoading)

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    )
  }

  // Redirect if not authenticated (this shouldn't happen due to ProtectedRoute, but just in case)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Update user profile via API
      const response = await usersApi.updateUser(user._id || user.id, data)
      
      if (response.success) {
        // Update user in store
        await updateProfile(data)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        throw new Error(response.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error", 
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading profile...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-start space-x-6 mb-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-700">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white hover:bg-amber-700"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.firstName || 'Not provided'}</p>
                  )}
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.lastName || 'Not provided'}</p>
                  )}
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                  )}
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
                  )}
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            </form>
          )}
        </div>
      </div>

      {/* Work Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Work Statistics</h2>
        </div>
        
        <div className="p-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShifts}</p>
                <p className="text-sm text-gray-600">Total Shifts</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Hours Worked</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageShiftLength.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Avg Shift Length</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <p className="text-gray-900">#{user?._id || user?.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Hours Worked
              </label>
              <p className="text-gray-900">
                {statsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  `${stats.totalHours.toFixed(1)} hours`
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Join Date
              </label>
              <p className="text-gray-900">{formatDate(stats.joinedDate)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Change Password
            </button>
            
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Download Work History
            </button>
            
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 