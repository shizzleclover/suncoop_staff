import { useState, useEffect } from 'react'
import { 
  Settings, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Save,
  Users,
  Calendar,
  Wifi,
  Shield
} from 'lucide-react'
import { BUSINESS_RULES } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // Business Rules
    maxDailyHours: BUSINESS_RULES.MAX_DAILY_HOURS || 8,
    maxMonthlyHours: BUSINESS_RULES.MAX_MONTHLY_HOURS || 160,
    maxCancellationsPerMonth: BUSINESS_RULES.MAX_MONTHLY_CANCELLATIONS || 3,
    workingHours: {
      start: BUSINESS_RULES.WORK_START_HOUR || 8,
      end: BUSINESS_RULES.WORK_END_HOUR || 22
    },
    maxShiftDuration: BUSINESS_RULES.MAX_SHIFT_DURATION || 8,
    cancellationNoticeHours: BUSINESS_RULES.CANCELLATION_NOTICE_HOURS || 24,
    penaltyHours: {
      noShow: BUSINESS_RULES.PENALTY_HOURS_NO_SHOW || 2,
      lateCancel: BUSINESS_RULES.PENALTY_HOURS_PER_CANCELLATION || 1
    },
    
    // System Settings
    locationVerification: {
      enabled: true,
      wifiRequired: true,
      gpsBackup: true,
      radiusMeters: 50
    },
    
    // Notification Settings
    notifications: {
      shiftReminders: true,
      cancellationAlerts: true,
      clockInReminders: true,
      emailNotifications: true,
      smsNotifications: false
    },
    
    // App Settings
    app: {
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      sessionTimeout: 8, // hours
      autoLogout: true
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('adminSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleDirectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSettings({
        maxDailyHours: BUSINESS_RULES.MAX_DAILY_HOURS || 8,
        maxMonthlyHours: BUSINESS_RULES.MAX_MONTHLY_HOURS || 160,
        maxCancellationsPerMonth: BUSINESS_RULES.MAX_MONTHLY_CANCELLATIONS || 3,
        workingHours: {
          start: BUSINESS_RULES.WORK_START_HOUR || 8,
          end: BUSINESS_RULES.WORK_END_HOUR || 22
        },
        maxShiftDuration: BUSINESS_RULES.MAX_SHIFT_DURATION || 8,
        cancellationNoticeHours: BUSINESS_RULES.CANCELLATION_NOTICE_HOURS || 24,
        penaltyHours: {
          noShow: BUSINESS_RULES.PENALTY_HOURS_NO_SHOW || 2,
          lateCancel: BUSINESS_RULES.PENALTY_HOURS_PER_CANCELLATION || 1
        },
        locationVerification: {
          enabled: true,
          wifiRequired: true,
          gpsBackup: true,
          radiusMeters: 50
        },
        notifications: {
          shiftReminders: true,
          cancellationAlerts: true,
          clockInReminders: true,
          emailNotifications: true,
          smsNotifications: false
        },
        app: {
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true,
          sessionTimeout: 8,
          autoLogout: true
        }
      })
      setHasChanges(true)
      toast.success('Settings reset to defaults')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">Configure business rules and system preferences</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isLoading}
              className={`px-4 py-2 rounded-md transition-colors flex items-center font-medium ${
                hasChanges && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Business Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Business Rules</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure operational limits and policies</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily Hours
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.maxDailyHours}
                onChange={(e) => handleDirectChange('maxDailyHours', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum hours an employee can work per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Monthly Hours
              </label>
              <input
                type="number"
                min="1"
                max="744"
                value={settings.maxMonthlyHours}
                onChange={(e) => handleDirectChange('maxMonthlyHours', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum hours an employee can work per month</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Shift Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.maxShiftDuration}
                onChange={(e) => handleDirectChange('maxShiftDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum duration for a single shift</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Notice (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.cancellationNoticeHours}
                onChange={(e) => handleDirectChange('cancellationNoticeHours', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Required notice period for shift cancellations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours Start
              </label>
              <select
                value={settings.workingHours.start}
                onChange={(e) => handleSettingChange('workingHours', 'start', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({length: 24}, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Earliest time shifts can start</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours End
              </label>
              <select
                value={settings.workingHours.end}
                onChange={(e) => handleSettingChange('workingHours', 'end', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({length: 24}, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Latest time shifts can end</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Verification */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Location Verification</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure location-based attendance tracking</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable Location Verification</h3>
              <p className="text-sm text-gray-600">Require employees to be at work location to clock in</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.locationVerification.enabled}
                onChange={(e) => handleSettingChange('locationVerification', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">WiFi Network Required</h3>
              <p className="text-sm text-gray-600">Require connection to workplace WiFi network</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.locationVerification.wifiRequired}
                onChange={(e) => handleSettingChange('locationVerification', 'wifiRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">GPS Backup</h3>
              <p className="text-sm text-gray-600">Use GPS when WiFi verification fails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.locationVerification.gpsBackup}
                onChange={(e) => handleSettingChange('locationVerification', 'gpsBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Radius (meters)
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={settings.locationVerification.radiusMeters}
              onChange={(e) => handleSettingChange('locationVerification', 'radiusMeters', parseInt(e.target.value))}
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Acceptable distance from work location</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure system notifications and alerts</p>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-600">
                  {key === 'shiftReminders' && 'Send reminders before shifts start'}
                  {key === 'cancellationAlerts' && 'Alert when shifts are cancelled'}
                  {key === 'clockInReminders' && 'Remind employees to clock in'}
                  {key === 'emailNotifications' && 'Send notifications via email'}
                  {key === 'smsNotifications' && 'Send notifications via SMS'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Application Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure application behavior and security</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Temporarily disable the application for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.app.maintenanceMode}
                onChange={(e) => handleSettingChange('app', 'maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Allow Registration</h3>
              <p className="text-sm text-gray-600">Allow new users to register accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.app.allowRegistration}
                onChange={(e) => handleSettingChange('app', 'allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Verification Required</h3>
              <p className="text-sm text-gray-600">Require email verification for new accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.app.requireEmailVerification}
                onChange={(e) => handleSettingChange('app', 'requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (hours)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={settings.app.sessionTimeout}
              onChange={(e) => handleSettingChange('app', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically log out users after this period</p>
          </div>
        </div>
      </div>
    </div>
  )
} 