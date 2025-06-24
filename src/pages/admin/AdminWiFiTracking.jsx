import { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../hooks/use-toast'
import { wifiTrackingApi, locationsApi } from '../../lib/api'
import AdminProtection from '../../components/AdminProtection'

export default function AdminWiFiTracking() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState([])
  const [pendingExplanations, setPendingExplanations] = useState([])
  const [wifiHealth, setWifiHealth] = useState(null)
  const [selectedExplanation, setSelectedExplanation] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadLocations(),
        loadPendingExplanations(),
        loadWifiHealth()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await locationsApi.getLocations()
      if (response.success && response.data?.locations) {
        setLocations(response.data.locations.filter(loc => loc.wifiSettings?.isTrackingEnabled))
      } else {
        setLocations([])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
    }
  }

  const loadPendingExplanations = async () => {
    try {
      const response = await wifiTrackingApi.getPendingExplanations()
      if (response.success && response.data?.explanations) {
        setPendingExplanations(response.data.explanations)
      } else {
        setPendingExplanations([])
      }
    } catch (error) {
      console.error('Error loading pending explanations:', error)
      setPendingExplanations([])
    }
  }

  const loadWifiHealth = async () => {
    try {
      const response = await wifiTrackingApi.getWiFiTrackingHealth()
      if (response.success) {
        setWifiHealth(response.data.health)
      }
    } catch (error) {
      console.error('Error loading WiFi health:', error)
    }
  }

  const handleReviewExplanation = async (isApproved) => {
    if (!selectedExplanation) return

    try {
      setSubmittingReview(true)
      const response = await wifiTrackingApi.reviewMissedShiftExplanation(
        selectedExplanation._id,
        isApproved,
        reviewNotes.trim()
      )

      if (response.success) {
        toast({
          title: "Review Submitted",
          description: `Explanation ${isApproved ? 'approved' : 'rejected'} successfully`,
        })
        
        setShowReviewModal(false)
        setSelectedExplanation(null)
        setReviewNotes('')
        loadPendingExplanations() // Refresh the list
      }
    } catch (error) {
      console.error('Error reviewing explanation:', error)
      toast({
        title: "Review Failed",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc._id === locationId)
    return location ? location.name : 'Unknown Location'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredExplanations = (pendingExplanations || []).filter(explanation => {
    const matchesSearch = !searchTerm || 
      explanation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationName(explanation.locationId).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = locationFilter === 'all' || explanation.locationId === locationFilter
    
    return matchesSearch && matchesLocation
  })

  if (loading) {
    return (
      <AdminProtection>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WiFi Tracking Management</h1>
              <p className="text-gray-600">Monitor WiFi-based time tracking and review explanations</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminProtection>
    )
  }

  return (
    <AdminProtection>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WiFi Tracking Management</h1>
            <p className="text-gray-600">Monitor WiFi-based time tracking and review explanations</p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* WiFi Health Status */}
        {wifiHealth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${wifiHealth.isHealthy ? 'bg-green-100' : 'bg-red-100'}`}>
                    {wifiHealth.isHealthy ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Overall Status</p>
                    <p className="text-sm text-gray-600">
                      {wifiHealth.isHealthy ? 'Healthy' : 'Issues Detected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wifi className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Active Connections</p>
                    <p className="text-sm text-gray-600">
                      {wifiHealth.activeConnections || 0} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Reviews</p>
                    <p className="text-sm text-gray-600">
                      {(pendingExplanations || []).length} explanations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Explanations ({(pendingExplanations || []).length})
            </TabsTrigger>
            <TabsTrigger value="locations">
              WiFi Locations ({(locations || []).length})
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              Live Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Pending Explanations Tab */}
          <TabsContent value="pending" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by staff name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {(locations || []).map(location => (
                    <SelectItem key={location._id} value={location._id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Explanations List */}
            <div className="space-y-4">
              {filteredExplanations.length > 0 ? (
                filteredExplanations.map((explanation) => (
                  <Card key={explanation._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{explanation.user?.name || 'Unknown User'}</h3>
                              <p className="text-sm text-gray-600">
                                {getLocationName(explanation.locationId)} • {new Date(explanation.shiftDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-medium text-sm mb-2">Explanation:</h4>
                            <p className="text-sm text-gray-700">{explanation.explanation}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Submitted: {new Date(explanation.submittedAt).toLocaleDateString()}</span>
                            <Badge className={getStatusColor(explanation.status)}>
                              {explanation.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExplanation(explanation)
                              setShowReviewModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending explanations</h3>
                  <p className="text-gray-600">All missed shift explanations have been reviewed</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* WiFi Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <Card key={location._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      {location.name}
                    </CardTitle>
                    <CardDescription>{location.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">SSID: {location.wifiSettings?.ssid || 'Not configured'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Grace Period: {location.wifiSettings?.gracePeriod || 10} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {location.wifiSettings?.isTrackingEnabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          Tracking {location.wifiSettings?.isTrackingEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live WiFi Status Monitor</CardTitle>
                <CardDescription>
                  Real-time view of staff WiFi connections and auto clock-in/out events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Live Monitoring</h3>
                  <p className="text-gray-600">
                    Real-time monitoring dashboard will be displayed here.<br />
                    This would show live WiFi connections, auto clock events, and system alerts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Missed Shift Explanation</DialogTitle>
              <DialogDescription>
                Review and approve or reject this explanation for missing a shift.
              </DialogDescription>
            </DialogHeader>
            
            {selectedExplanation && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Staff Member:</h4>
                  <p className="text-sm text-gray-700">{selectedExplanation.user?.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Location & Date:</h4>
                  <p className="text-sm text-gray-700">
                    {getLocationName(selectedExplanation.locationId)} • {new Date(selectedExplanation.shiftDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Explanation:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedExplanation.explanation}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Admin Notes (Optional):</h4>
                  <Textarea
                    placeholder="Add any notes about your decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReviewExplanation(false)}
                disabled={submittingReview}
              >
                {submittingReview ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleReviewExplanation(true)}
                disabled={submittingReview}
              >
                {submittingReview ? 'Processing...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtection>
  )
} 