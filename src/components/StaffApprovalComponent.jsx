import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar, Building } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { usersApi } from '../lib/api'
import { LoadingSpinner } from './LoadingSpinner'

export default function StaffApprovalComponent() {
  const { toast } = useToast()
  const [pendingStaff, setPendingStaff] = useState([]) // Always initialize as array
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const loadPendingApprovals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await usersApi.getPendingStaffApprovals()
      
      if (response && response.success && response.data) {
        // The backend returns data.users as the array
        const staffData = response.data.users
        
        // Ensure we always have an array
        if (Array.isArray(staffData)) {
          setPendingStaff(staffData)
        } else {
          console.warn('Pending staff data is not an array:', staffData)
          setPendingStaff([])
        }
      } else {
        console.warn('Invalid response structure:', response)
        setPendingStaff([])
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error)
      setPendingStaff([]) // Always ensure we have an array
      toast({
        title: "Error",
        description: "Failed to load pending staff approvals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadPendingApprovals()
  }, [loadPendingApprovals])

  const handleApproveStaff = async (staffId) => {
    try {
      setProcessingId(staffId)
      const response = await usersApi.approveStaff(staffId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member approved successfully",
        })
        
        // Remove from pending list
        setPendingStaff(prev => prev.filter(staff => staff._id !== staffId))
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error approving staff:', error)
      toast({
        title: "Error",
        description: "Failed to approve staff member",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectStaff = async (staffId) => {
    try {
      setProcessingId(staffId)
      const response = await usersApi.rejectStaff(staffId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member registration rejected",
        })
        
        // Remove from pending list
        setPendingStaff(prev => prev.filter(staff => staff._id !== staffId))
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error rejecting staff:', error)
      toast({
        title: "Error",
        description: "Failed to reject staff member",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Staff Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Loading pending approvals..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Staff Approvals
          {Array.isArray(pendingStaff) && pendingStaff.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingStaff.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Review and approve new staff registration requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!Array.isArray(pendingStaff) || pendingStaff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Pending Approvals</p>
            <p className="text-sm">All staff registration requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingStaff.map((staff) => (
              <div key={staff._id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {staff.firstName} {staff.lastName}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{staff.email}</span>
                        </div>
                        
                        {staff.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{staff.phone}</span>
                          </div>
                        )}
                        
                        {staff.department && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{staff.department}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {formatDate(staff.createdAt)}</span>
                        </div>
                      </div>

                      {staff.organizationType && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            {staff.organizationType}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectStaff(staff._id)}
                      disabled={processingId === staff._id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {processingId === staff._id ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleApproveStaff(staff._id)}
                      disabled={processingId === staff._id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === staff._id ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 