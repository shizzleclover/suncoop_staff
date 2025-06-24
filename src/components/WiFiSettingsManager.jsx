import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Settings, Save, AlertTriangle, Info, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { useToast } from '../hooks/use-toast'
import { locationsApi } from '../lib/api'

export default function WiFiSettingsManager() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null) // ID of location being saved
  const [editingLocation, setEditingLocation] = useState(null)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const response = await locationsApi.getLocations()
      setLocations(response.data.locations || [])
    } catch (error) {
      console.error('Failed to load locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleWiFiSettingChange = (locationId, field, value) => {
    setLocations(prev => prev.map(location => {
      if (location._id === locationId) {
        return {
          ...location,
          wifiSettings: {
            ...location.wifiSettings,
            [field]: value
          }
        }
      }
      return location
    }))
  }

  const saveWiFiSettings = async (location) => {
    try {
      setSaving(location._id)
      
      await locationsApi.updateLocation(location._id, {
        wifiSettings: location.wifiSettings
      })
      
      toast.success(`WiFi settings updated for ${location.name}`)
      setEditingLocation(null)
      
    } catch (error) {
      console.error('Failed to save WiFi settings:', error)
      toast.error('Failed to save WiFi settings')
    } finally {
      setSaving(null)
    }
  }

  const toggleCardExpansion = (locationId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(locationId)) {
        newSet.delete(locationId)
      } else {
        newSet.add(locationId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WiFi Settings Management</h2>
          <p className="text-gray-600 mt-1">Configure WiFi-based clock in/out restrictions for your locations</p>
        </div>
      </div>

      {/* Overview Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <div className="font-medium">About WiFi-Based Clock In/Out:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Employees must be connected to the office WiFi to clock in or out</li>
              <li>Prevents remote clock in/out and ensures physical presence</li>
              <li>Works alongside automatic WiFi tracking features</li>
              <li>Can be enabled independently for each location</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Locations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const isExpanded = expandedCards.has(location._id)
          const isEditing = editingLocation === location._id
          const isSaving = saving === location._id
          const wifiEnabled = location.wifiSettings?.requireWifiForClockInOut
          const hasSSID = location.wifiSettings?.ssid?.trim()

          return (
            <Card key={location._id} className={`transition-all ${wifiEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {wifiEnabled ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-gray-400" />
                    )}
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCardExpansion(location._id)}
                  >
                    {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wifiEnabled ? 'success' : 'secondary'} className="text-xs">
                    {wifiEnabled ? 'WiFi Required' : 'No WiFi Required'}
                  </Badge>
                  {wifiEnabled && hasSSID && (
                    <Badge variant="outline" className="text-xs">
                      {location.wifiSettings.ssid}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* WiFi Requirement Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Require WiFi for Clock In/Out</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Employees must be connected to office WiFi
                      </div>
                    </div>
                    <Switch
                      checked={wifiEnabled}
                      onCheckedChange={(checked) => {
                        handleWiFiSettingChange(location._id, 'requireWifiForClockInOut', checked)
                        if (checked && !isEditing) {
                          setEditingLocation(location._id)
                        }
                      }}
                    />
                  </div>

                  {/* SSID Configuration */}
                  {wifiEnabled && (
                    <div className="space-y-3 p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">WiFi Network Configuration</span>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Network Name (SSID)</label>
                        <Input
                          value={location.wifiSettings?.ssid || ''}
                          onChange={(e) => {
                            handleWiFiSettingChange(location._id, 'ssid', e.target.value)
                            setEditingLocation(location._id)
                          }}
                          placeholder="Enter WiFi network name"
                          className="text-sm"
                        />
                        <div className="text-xs text-gray-500">
                          💡 This is the WiFi network name that appears when connecting to WiFi
                        </div>
                      </div>

                      {!hasSSID && (
                        <Alert className="border-amber-200 bg-amber-50">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800 text-xs">
                            You must enter a WiFi network name (SSID) for this feature to work properly.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Additional WiFi Settings */}
                  {wifiEnabled && (
                    <div className="space-y-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-sm">Additional WiFi Features</div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm">WiFi Tracking</div>
                            <div className="text-xs text-gray-600">Enable general WiFi tracking features</div>
                          </div>
                          <Switch
                            checked={location.wifiSettings?.isWifiTrackingEnabled || false}
                            onCheckedChange={(checked) => {
                              handleWiFiSettingChange(location._id, 'isWifiTrackingEnabled', checked)
                              setEditingLocation(location._id)
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm">Auto Clock In</div>
                            <div className="text-xs text-gray-600">Automatically clock in when WiFi connects</div>
                          </div>
                          <Switch
                            checked={location.wifiSettings?.autoClockInEnabled || false}
                            onCheckedChange={(checked) => {
                              handleWiFiSettingChange(location._id, 'autoClockInEnabled', checked)
                              setEditingLocation(location._id)
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm">Auto Clock Out</div>
                            <div className="text-xs text-gray-600">Automatically clock out when WiFi disconnects</div>
                          </div>
                          <Switch
                            checked={location.wifiSettings?.autoClockOutEnabled || false}
                            onCheckedChange={(checked) => {
                              handleWiFiSettingChange(location._id, 'autoClockOutEnabled', checked)
                              setEditingLocation(location._id)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  {isEditing && (
                    <Button
                      onClick={() => saveWiFiSettings(location)}
                      disabled={isSaving || (wifiEnabled && !hasSSID)}
                      className="w-full"
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save WiFi Settings
                        </>
                      )}
                    </Button>
                  )}

                  {/* Status Indicator */}
                  {wifiEnabled && hasSSID && !isEditing && (
                    <div className="flex items-center gap-2 p-2 bg-green-100 rounded text-xs text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      <span>WiFi-based clock in/out is active for this location</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
          <p className="text-gray-600">Create some locations first to configure WiFi settings.</p>
        </div>
      )}
    </div>
  )
} 