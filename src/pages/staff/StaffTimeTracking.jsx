import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react'
import { formatTime, formatDate, calculateHours } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { timeTrackingApi } from '../../lib/api'
import { useToast } from '../../hooks/use-toast'

export default function StaffTimeTracking() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [timeEntries, setTimeEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null)
  const [timeSummary, setTimeSummary] = useState({
    totalHours: 0,
    totalRegularHours: 0,
    totalOvertimeHours: 0,
    totalPay: 0
  })

  useEffect(() => {
    loadTimeEntries()
    loadTimeSummary()
    checkCurrentTimeEntry()
  }, [user])

  const loadTimeEntries = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await timeTrackingApi.getTimeEntries({
        userId: user.id,
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      })
      setTimeEntries(response.data.timeEntries || [])
    } catch (error) {
      console.error('Failed to load time entries:', error)
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTimeSummary = async () => {
    if (!user) return
    
    try {
      const response = await timeTrackingApi.getTimeSummary({
        userId: user.id,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        endDate: new Date().toISOString()
      })
      setTimeSummary(response.data.summary || {})
    } catch (error) {
      console.error('Failed to load time summary:', error)
    }
  }

  const checkCurrentTimeEntry = async () => {
    if (!user) return
    
    try {
      const response = await timeTrackingApi.getCurrentlyWorking()
      const currentEntry = response.data.timeEntries.find(
        entry => entry.userId._id === user.id
      )
      setCurrentTimeEntry(currentEntry || null)
    } catch (error) {
      console.error('Failed to check current time entry:', error)
    }
  }

  const TimeEntryCard = ({ entry }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800'
        case 'rejected': return 'bg-red-100 text-red-800'
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'clocked_in': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'approved': return <CheckCircle className="h-4 w-4" />
        case 'rejected': return <XCircle className="h-4 w-4" />
        case 'pending': return <AlertTriangle className="h-4 w-4" />
        case 'clocked_in': return <Clock className="h-4 w-4" />
        default: return <Clock className="h-4 w-4" />
      }
    }

    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              {formatDate(entry.date)}
            </CardTitle>
            <Badge variant="outline" className={getStatusColor(entry.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(entry.status)}
                <span className="capitalize">{entry.status}</span>
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{entry.locationId?.name || 'Unknown Location'}</span>
            </div>

            {/* Time details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {entry.clockInTime && (
                <div>
                  <span className="text-gray-500">Clock In:</span>
                  <p className="font-medium">{formatTime(entry.clockInTime)}</p>
                </div>
              )}
              {entry.clockOutTime && (
                <div>
                  <span className="text-gray-500">Clock Out:</span>
                  <p className="font-medium">{formatTime(entry.clockOutTime)}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Hours Worked:</span>
                <p className="font-medium">{entry.hoursWorked || 0} hrs</p>
              </div>
              {entry.breakTime > 0 && (
                <div>
                  <span className="text-gray-500">Break Time:</span>
                  <p className="font-medium">{entry.breakTime} mins</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {entry.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <span className="text-xs text-gray-500">Notes:</span>
                <p className="text-sm text-gray-700">{entry.notes}</p>
              </div>
            )}

            {/* Admin notes for rejected entries */}
            {entry.status === 'rejected' && entry.adminNotes && (
              <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-200">
                <span className="text-xs text-red-600 font-medium">Rejection Reason:</span>
                <p className="text-sm text-red-700">{entry.adminNotes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Hours (This Month)</CardDescription>
            <CardTitle className="text-2xl">{timeSummary.totalHours || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Regular Hours</CardDescription>
            <CardTitle className="text-2xl">{timeSummary.totalRegularHours || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overtime Hours</CardDescription>
            <CardTitle className="text-2xl">{timeSummary.totalOvertimeHours || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pay</CardDescription>
            <CardTitle className="text-2xl">${timeSummary.totalPay || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Current Status */}
      {currentTimeEntry && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Currently Working
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Location:</strong> {currentTimeEntry.locationId?.name}</p>
              <p><strong>Clock In:</strong> {formatTime(currentTimeEntry.clockInTime)}</p>
              <p><strong>Duration:</strong> {calculateHours(currentTimeEntry.clockInTime, new Date())} hours</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Entries */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Time Entries</h2>
        
        {timeEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeEntries.map((entry) => (
              <TimeEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Entries</h3>
              <p className="text-gray-600">You haven't logged any time entries yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 