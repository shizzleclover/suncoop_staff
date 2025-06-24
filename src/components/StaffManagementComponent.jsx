import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  UserMinus, 
  UserCheck, 
  X, 
  Trash2,
  Plus 
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { useToast } from '../hooks/use-toast'
import { usersApi } from '../lib/api'
import { LoadingSpinner } from './LoadingSpinner'
import AddUserModal from './AddUserModal'
import StaffEditModal from './StaffEditModal'

export default function StaffManagementComponent() {
  const { toast } = useToast()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', staffId: null, confirmText: '' })
  const [processingId, setProcessingId] = useState(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const dropdownRefs = useRef({})

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(openDropdowns).forEach(staffId => {
        if (openDropdowns[staffId] && 
            dropdownRefs.current[staffId] && 
            !dropdownRefs.current[staffId].contains(event.target)) {
          setOpenDropdowns(prev => ({ ...prev, [staffId]: false }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdowns])

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true)
      const response = await usersApi.getUsers({ 
        role: 'staff',
        limit: 100,
        approvalStatus: 'approved'
      })
      
      if (response.success && response.data.users) {
        setStaff(response.data.users)
      } else {
        setStaff([])
      }
    } catch (error) {
      console.error('Error loading staff:', error)
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive"
      })
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const toggleDropdown = (staffId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }))
  }

  const handleToggleStatus = async (staffId) => {
    const staffMember = staff.find(s => s._id === staffId)
    if (!staffMember) return

    try {
      setProcessingId(staffId)
      
      const response = staffMember.isActive 
        ? await usersApi.deactivateUser(staffId)
        : await usersApi.reactivateUser(staffId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Staff member ${staffMember.isActive ? 'deactivated' : 'reactivated'} successfully`,
        })
        
        setStaff(prev => prev.map(s => 
          s._id === staffId 
            ? { ...s, isActive: !s.isActive }
            : s
        ))
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update staff status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling staff status:', error)
      toast({
        title: "Error",
        description: "Failed to update staff member status",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
      setOpenDropdowns(prev => ({ ...prev, [staffId]: false }))
    }
  }

  const handleDeleteStaff = async (staffId) => {
    if (confirmDialog.confirmText !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessingId(staffId)
      
      const response = await usersApi.deleteUser(staffId, confirmDialog.confirmText)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member deleted permanently",
        })
        
        setStaff(prev => prev.filter(s => s._id !== staffId))
        setConfirmDialog({ open: false, type: '', staffId: null, confirmText: '' })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleUserAdded = (newUser) => {
    setStaff(prev => [...prev, newUser])
    setShowAddUserModal(false)
  }

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember)
    setShowEditModal(true)
    setOpenDropdowns(prev => ({ ...prev, [staffMember._id]: false }))
  }

  const handleStaffUpdated = (updatedStaff) => {
    setStaff(prev => prev.map(s => 
      s._id === updatedStaff._id ? updatedStaff : s
    ))
    setShowEditModal(false)
    setEditingStaff(null)
  }

  const getFilteredStaff = () => {
    return staff.filter(member => {
      const matchesSearch = searchTerm === '' || 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.employeeId && member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && member.isActive) ||
        (statusFilter === 'inactive' && !member.isActive)

      return matchesSearch && matchesStatus
    })
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredStaff = getFilteredStaff()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Loading staff members..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Management
              </CardTitle>
              <CardDescription>
                Manage active staff members and their accounts
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddUserModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 md:h-9"
              />
            </div>
            <div className="relative min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 md:py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Staff List */}
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchTerm || statusFilter !== 'all' ? 'No staff found' : 'No Staff Members'}
              </p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add your first staff member to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.map((member) => (
                <div key={member._id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base md:text-lg text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600 mt-1">
                          <span className="truncate">{member.email}</span>
                          {member.employeeId && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-xs text-gray-500">ID: {member.employeeId}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(member.isActive)}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {member.department && (
                            <Badge variant="outline" className="text-xs">{member.department}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                      <div className="text-xs text-gray-500 sm:text-sm">
                        Joined {formatDate(member.createdAt)}
                      </div>
                      <div className="relative" ref={el => dropdownRefs.current[member._id] = el}>
                        <DropdownMenu 
                          open={openDropdowns[member._id]} 
                          onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, [member._id]: open }))}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown(member._id)
                              }}
                              disabled={processingId === member._id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(member._id)}
                              className={member.isActive ? "text-orange-600" : "text-green-600"}
                            >
                              {member.isActive ? (
                                <>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reactivate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  type: 'delete',
                                  staffId: member._id,
                                  confirmText: ''
                                })
                                setOpenDropdowns(prev => ({ ...prev, [member._id]: false }))
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Permanently Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Permanently Delete Staff Member
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the staff member's account 
              and remove all associated data including shifts and time entries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>User account and profile</li>
                <li>All shift assignments</li>
                <li>Time tracking entries</li>
                <li>Notifications and history</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <Input
                value={confirmDialog.confirmText}
                onChange={(e) => setConfirmDialog({ ...confirmDialog, confirmText: e.target.value })}
                placeholder="Type DELETE here"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, type: '', staffId: null, confirmText: '' })}
              disabled={processingId}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleDeleteStaff(confirmDialog.staffId)}
              disabled={processingId || confirmDialog.confirmText !== 'DELETE'}
            >
              {processingId ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Edit Staff Modal */}
      <StaffEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingStaff(null)
        }}
        staffMember={editingStaff}
        onStaffUpdated={handleStaffUpdated}
      />
    </>
  )
} 