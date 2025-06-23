import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from '../../store'
import AdminProtection from '../../components/AdminProtection'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProfile() {
  const { user: currentUser, updateProfile, changePassword } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    username: currentUser?.username || '',
    phone: currentUser?.phone || '',
    organizationName: currentUser?.organizationName || '',
    organizationType: currentUser?.organizationType || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [activeTab, setActiveTab] = useState('profile')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const validateProfileForm = () => {
    const newErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = updateProfile(profileData)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )
      
      if (result.success) {
        toast.success('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(result.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <AdminProtection>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account information and security settings
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={profileData.username}
                      onChange={(e) => handleProfileInputChange('username', e.target.value)}
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={profileData.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={profileData.phone}
                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Organization Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        placeholder="Enter organization name"
                        value={profileData.organizationName}
                        onChange={(e) => handleProfileInputChange('organizationName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type</Label>
                      <Input
                        id="organizationType"
                        placeholder="Enter organization type"
                        value={profileData.organizationType}
                        onChange={(e) => handleProfileInputChange('organizationType', e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Password Requirements</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Minimum 6 characters long</li>
                          <li>Must be different from current password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Account Type:</span>
                <span className="ml-2 text-gray-600">
                  {currentUser?.isSuperAdmin ? 'Super Administrator' : 'Administrator'}
                </span>
              </div>
              <div>
                <span className="font-medium">Member Since:</span>
                <span className="ml-2 text-gray-600">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Login:</span>
                <span className="ml-2 text-gray-600">
                  {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium">Account Status:</span>
                <span className="ml-2 text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminProtection>
  )
} 