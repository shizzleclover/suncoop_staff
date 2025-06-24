import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Clock, AlertCircle, CheckCircle, X, Send } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { useToast } from '../hooks/use-toast'
import { wifiTrackingApi } from '../lib/api'

export default function WiFiTrackingComponent({ locations = [] }) {
  const { toast } = useToast()
  const [wifiStatus, setWifiStatus] = useState(null)
  const [connectionHistory, setConnectionHistory] = useState([])
  const [missedShifts, setMissedShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExplanationModal, setShowExplanationModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [submittingExplanation, setSubmittingExplanation] = useState(false)

  // Load initial data
  useEffect(() => {
    loadWiFiData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadWiFiStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Check for WiFi network availability and report status
  useEffect(() => {
    const checkWiFiAndReport = async () => {
      if ('navigator' in window && 'connection' in navigator) {
        try {
          // Get current WiFi info (limited by browser security)
          const connection = navigator.connection
          
          // Try to detect if we're on WiFi vs cellular
          const isWiFi = connection?.type === 'wifi' || 
                        (connection?.effectiveType === '4g' && connection?.downlink > 5)

          if (isWiFi) {
            // Attempt to get more detailed network info (may require permissions)
            await detectAndReportWiFi()
          }
        } catch (error) {
          console.log('WiFi detection not supported or failed:', error)
        }
      }
    }

    checkWiFiAndReport()
    const interval = setInterval(checkWiFiAndReport, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [locations])

  const loadWiFiData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadWiFiStatus(),
        loadConnectionHistory(),
        loadMissedShifts()
      ])
    } catch (error) {
      console.error('Error loading WiFi data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWiFiStatus = async () => {
    try {
      const response = await wifiTrackingApi.getWiFiStatus()
      if (response.success) {
        setWifiStatus(response.data.status)
      }
    } catch (error) {
      console.error('Error loading WiFi status:', error)
    }
  }

  const loadConnectionHistory = async () => {
    try {
      const response = await wifiTrackingApi.getConnectionHistory(7)
      if (response.success) {
        setConnectionHistory(response.data.history)
      }
    } catch (error) {
      console.error('Error loading connection history:', error)
    }
  }

  const loadMissedShifts = async () => {
    try {
      const response = await wifiTrackingApi.getUserMissedShifts()
      if (response.success) {
        setMissedShifts(response.data.missedShifts)
      }
    } catch (error) {
      console.error('Error loading missed shifts:', error)
    }
  }

  const detectAndReportWiFi = async () => {
    try {
      // Simple network detection - limited by browser security
      // In a real app, this would need native mobile app capabilities
      
      // For web app, we can only detect basic connection info
      if ('navigator' in window && 'connection' in navigator) {
        const connection = navigator.connection
        
        // Check if we have a potential office location match
        const currentPosition = await getCurrentPosition()
        if (currentPosition) {
          const nearbyLocation = findNearbyLocation(currentPosition)
          
          if (nearbyLocation) {
            // Report potential WiFi connection
            await reportWiFiStatus({
              ssid: nearbyLocation.wifiSettings?.ssid || 'Unknown',
              isConnected: true,
              locationId: nearbyLocation._id,
              deviceInfo: {
                userAgent: navigator.userAgent,
                connectionType: connection?.effectiveType,
                downlink: connection?.downlink
              },
              coordinates: currentPosition
            })
          }
        }
      }
    } catch (error) {
      console.error('WiFi detection error:', error)
    }
  }

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => reject(error),
        { timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  const findNearbyLocation = (position) => {
    // Simple distance calculation to find nearby locations
    const NEARBY_RADIUS = 0.1 // ~100 meters in decimal degrees
    
    return locations.find(location => {
      if (!location.coordinates) return false
      
      const distance = Math.sqrt(
        Math.pow(location.coordinates.latitude - position.latitude, 2) +
        Math.pow(location.coordinates.longitude - position.longitude, 2)
      )
      
      return distance <= NEARBY_RADIUS && location.wifiSettings?.isTrackingEnabled
    })
  }

  const reportWiFiStatus = async (statusData) => {
    try {
      const response = await wifiTrackingApi.reportWiFiStatus(statusData)
      if (response.success) {
        setWifiStatus(response.data.wifiStatus)
        
        if (response.data.actions?.length > 0) {
          response.data.actions.forEach(action => {
            toast({
              title: action.type === 'clock_in' ? 'Auto Clock In' : 'Auto Clock Out',
              description: action.message,
              variant: action.success ? 'default' : 'destructive'
            })
          })
        }
        
        // Refresh data
        loadConnectionHistory()
      }
    } catch (error) {
      console.error('Error reporting WiFi status:', error)
      toast({
        title: 'WiFi Status Error',
        description: 'Failed to report WiFi status',
        variant: 'destructive'
      })
    }
  }

  const handleSubmitExplanation = async () => {
    if (!selectedShift || !explanation.trim()) return

    try {
      setSubmittingExplanation(true)
      const response = await wifiTrackingApi.submitMissedShiftExplanation(
        selectedShift._id,
        explanation.trim()
      )

      if (response.success) {
        toast({
          title: 'Explanation Submitted',
          description: 'Your explanation has been submitted for review'
        })
        setShowExplanationModal(false)
        setSelectedShift(null)
        setExplanation('')
        loadMissedShifts() // Refresh missed shifts
      }
    } catch (error) {
      console.error('Error submitting explanation:', error)
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit explanation',
        variant: 'destructive'
      })
    } finally {
      setSubmittingExplanation(false)
    }
  }

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc._id === locationId)
    return location ? location.name : 'Unknown Location'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      case 'connecting': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      case 'connecting': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WiFi Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current WiFi Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WiFi Tracking Status
          </CardTitle>
          <CardDescription>
            Automatic time tracking based on WiFi connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wifiStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(wifiStatus.status)}
                  <div>
                    <p className="font-medium">{getLocationName(wifiStatus.locationId)}</p>
                    <p className="text-sm text-gray-600">{wifiStatus.ssid}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(wifiStatus.status)}>
                  {wifiStatus.status}
                </Badge>
              </div>
              
              {wifiStatus.connectedAt && (
                <p className="text-sm text-gray-600">
                  Connected since: {new Date(wifiStatus.connectedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No WiFi tracking active</p>
              <p className="text-sm text-gray-500">Connect to office WiFi to enable automatic tracking</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missed Shifts Requiring Explanation */}
      {missedShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Missed Shifts - Explanation Required
            </CardTitle>
            <CardDescription>
              You have missed shifts that require an explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missedShifts.map((shift) => (
                <div key={shift._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{getLocationName(shift.locationId)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(shift.startTime).toLocaleDateString()} at {' '}
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {shift.explanationStatus && (
                      <Badge 
                        variant={shift.explanationStatus === 'approved' ? 'default' : 
                               shift.explanationStatus === 'rejected' ? 'destructive' : 'secondary'}
                        className="mt-1"
                      >
                        {shift.explanationStatus}
                      </Badge>
                    )}
                  </div>
                  {!shift.explanation && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedShift(shift)
                        setShowExplanationModal(true)
                      }}
                    >
                      Explain
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Connection History */}
      {connectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Connection History</CardTitle>
            <CardDescription>Your WiFi connection activity (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectionHistory.slice(0, 5).map((connection, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(connection.status)}
                    <div>
                      <p className="text-sm font-medium">{getLocationName(connection.locationId)}</p>
                      <p className="text-xs text-gray-600">{connection.ssid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(connection.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(connection.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explanation Modal */}
      <Dialog open={showExplanationModal} onOpenChange={setShowExplanationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explain Missed Shift</DialogTitle>
            <DialogDescription>
              Please provide an explanation for why you missed this shift. This will be reviewed by management.
            </DialogDescription>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{getLocationName(selectedShift.locationId)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedShift.startTime).toLocaleDateString()} at {' '}
                  {new Date(selectedShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Explanation</label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Please explain why you missed this shift..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowExplanationModal(false)}
              disabled={submittingExplanation}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitExplanation}
              disabled={!explanation.trim() || submittingExplanation}
            >
              {submittingExplanation ? 'Submitting...' : 'Submit Explanation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 