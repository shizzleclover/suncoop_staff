import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Save,
  Users,
  Calendar,
  Shield,
  Bell,
  Mail,
  Smartphone,
  RotateCcw,
  CheckCircle,
  Info,
  Timer,
  Building2
} from 'lucide-react'
import { BUSINESS_RULES } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'

export default function AdminSettings() {
  const { toast } = useToast()
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
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
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
      toast({
        title: "Reset Complete",
        description: "Settings have been reset to defaults",
      })
    }
  }

  return (
    <div className="main-content">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Configure business rules and system preferences
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Business Rules */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <Clock className="h-5 w-5 text-blue-600" />
            Business Rules
          </CardTitle>
          <CardDescription>
            Configure operational limits and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxDailyHours">Max Daily Hours</Label>
              <Input
                id="maxDailyHours"
                type="number"
                min="1"
                max="24"
                value={settings.maxDailyHours}
                onChange={(e) => handleDirectChange('maxDailyHours', parseInt(e.target.value))}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Maximum hours an employee can work per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMonthlyHours">Max Monthly Hours</Label>
              <Input
                id="maxMonthlyHours"
                type="number"
                min="1"
                max="744"
                value={settings.maxMonthlyHours}
                onChange={(e) => handleDirectChange('maxMonthlyHours', parseInt(e.target.value))}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Maximum hours an employee can work per month
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxShiftDuration">Max Shift Duration (hours)</Label>
              <Input
                id="maxShiftDuration"
                type="number"
                min="1"
                max="24"
                value={settings.maxShiftDuration}
                onChange={(e) => handleDirectChange('maxShiftDuration', parseInt(e.target.value))}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Maximum duration for a single shift
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellationNotice">Cancellation Notice (hours)</Label>
              <Input
                id="cancellationNotice"
                type="number"
                min="1"
                max="168"
                value={settings.cancellationNoticeHours}
                onChange={(e) => handleDirectChange('cancellationNoticeHours', parseInt(e.target.value))}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Required notice period for shift cancellations
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workStart">Working Hours Start</Label>
              <Select
                value={settings.workingHours.start.toString()}
                onValueChange={(value) => handleSettingChange('workingHours', 'start', parseInt(value))}
              >
                <SelectTrigger id="workStart">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 24}, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Earliest time shifts can start
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEnd">Working Hours End</Label>
              <Select
                value={settings.workingHours.end.toString()}
                onValueChange={(value) => handleSettingChange('workingHours', 'end', parseInt(value))}
              >
                <SelectTrigger id="workEnd">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 24}, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Latest time shifts can end
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <Bell className="h-5 w-5 text-green-600" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure system notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {Object.entries(settings.notifications).map(([key, value], index) => (
            <div key={key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {key === 'emailNotifications' && <Mail className="h-4 w-4 text-blue-600" />}
                  {key === 'smsNotifications' && <Smartphone className="h-4 w-4 text-green-600" />}
                  {key === 'shiftReminders' && <Timer className="h-4 w-4 text-orange-600" />}
                  {key === 'cancellationAlerts' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {key === 'clockInReminders' && <Clock className="h-4 w-4 text-purple-600" />}
                  
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {key === 'shiftReminders' && 'Send reminders before shifts start'}
                      {key === 'cancellationAlerts' && 'Alert when shifts are cancelled'}
                      {key === 'clockInReminders' && 'Remind employees to clock in'}
                      {key === 'emailNotifications' && 'Send notifications via email'}
                      {key === 'smsNotifications' && 'Send notifications via SMS'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleSettingChange('notifications', key, checked)}
                />
              </div>
              {index < Object.entries(settings.notifications).length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <Shield className="h-5 w-5 text-purple-600" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure application behavior and security
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Maintenance Mode</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Temporarily disable the application for maintenance
                </p>
              </div>
            </div>
            <Switch
              checked={settings.app.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('app', 'maintenanceMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Allow Registration</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
            </div>
            <Switch
              checked={settings.app.allowRegistration}
              onCheckedChange={(checked) => handleSettingChange('app', 'allowRegistration', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Email Verification Required</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
            </div>
            <Switch
              checked={settings.app.requireEmailVerification}
              onCheckedChange={(checked) => handleSettingChange('app', 'requireEmailVerification', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4 text-orange-600" />
              <Input
                id="sessionTimeout"
                type="number"
                min="1"
                max="24"
                value={settings.app.sessionTimeout}
                onChange={(e) => handleSettingChange('app', 'sessionTimeout', parseInt(e.target.value))}
                className="w-32 text-base"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically log out users after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>



      {/* Success Message */}
      {!hasChanges && !isLoading && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All settings are up to date and saved.
          </AlertDescription>
        </Alert>
      )}
      </div>
    </div>
  )
} 