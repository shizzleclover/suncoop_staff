import { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { timeTrackingApi } from '../lib/api'
import { useToast } from '../hooks/use-toast'

export default function WiFiStatusIndicator({ locationId, onStatusChange, className = "" }) {
  const [wifiStatus, setWifiStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)
  const { toast } = useToast()

  const checkWiFiStatus = async () => {
    if (!locationId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await timeTrackingApi.checkWiFiRequirements(locationId)
      setWifiStatus(response.data)
      setLastChecked(new Date())
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(response.data)
      }
    } catch (error) {
      console.error('Failed to check WiFi status:', error)
      toast.error('Failed to check WiFi status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkWiFiStatus()
    
    // Set up interval to check WiFi status every 30 seconds
    const interval = setInterval(checkWiFiStatus, 30000)
    
    return () => clearInterval(interval)
  }, [locationId])

  if (loading && !wifiStatus) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">Checking WiFi status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!wifiStatus) {
    return null
  }

  // If WiFi is not required, show a simple success message
  if (!wifiStatus.wifiRequired) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-green-900">Ready to Clock In/Out</div>
              <div className="text-sm text-green-700">No WiFi requirements for this location</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // WiFi is required - show connection status
  const isConnected = wifiStatus.wifiConnected
  const canClockInOut = wifiStatus.canClockIn && wifiStatus.canClockOut

  return (
    <Card className={`${isConnected ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'} ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${isConnected ? 'text-green-900' : 'text-amber-900'}`}>
                {isConnected ? 'WiFi Connected' : 'WiFi Required'}
              </div>
              <div className={`text-sm ${isConnected ? 'text-green-700' : 'text-amber-700'}`}>
                {isConnected 
                  ? `Connected to "${wifiStatus.requiredSSID}"`
                  : `Please connect to "${wifiStatus.requiredSSID}"`
                }
              </div>
            </div>
            <Badge variant={canClockInOut ? 'success' : 'warning'}>
              {canClockInOut ? 'Can Clock In/Out' : 'Cannot Clock In/Out'}
            </Badge>
          </div>

          {/* Connection details */}
          {isConnected && wifiStatus.connectionDetails && (
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>
                  Connected since {new Date(wifiStatus.connectionDetails.connectedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {/* Warning message for disconnected state */}
          {!isConnected && (
            <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">WiFi connection required</div>
                  <div className="mt-1">
                    You must be connected to the office WiFi network to clock in or out at {wifiStatus.locationName}.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refresh button and last checked time */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {lastChecked && (
                <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkWiFiStatus}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Checking...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 