import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  Calendar,
  Filter,
  Clock,
  Shield
} from 'lucide-react'

import { USER_ROLES, formatDate } from '../../lib/utils'
import { useAuthStore } from '../../store'
import { usersApi } from '../../lib/api'
import AddUserModal from '../../components/AddUserModal'
import AdminProtection from '../../components/AdminProtection'
import { useToast } from '../../hooks/use-toast'

export default function AdminStaff() {
  const { user: currentUser } = useAuthStore()
  const { toast } = useToast()
  const [staff, setStaff] = useState([])
  const [filteredStaff, setFilteredStaff] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if current user is admin
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN

  useEffect(() => {
    // Load staff data - only admins can view all users
    const loadUsers = async () => {
      if (!isAdmin) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        console.log('Loading users...')
        const response = await usersApi.getUsers()
        console.log('Users API response:', response)
        
        if (response.success && response.data && response.data.users) {
          const allUsers = response.data.users
          console.log('All users:', allUsers)
          const staffMembers = allUsers.filter(user => user.role === 'staff')
          console.log('Staff members:', staffMembers)
          setStaff(staffMembers)
          setFilteredStaff(staffMembers)
        } else if (response.data && Array.isArray(response.data)) {
          // Handle if response.data is directly an array
          const allUsers = response.data
          const staffMembers = allUsers.filter(user => user.role === 'staff')
          setStaff(staffMembers)
          setFilteredStaff(staffMembers)
        } else {
          // Handle empty or invalid response
          console.log('No valid user data in response')
          setStaff([])
          setFilteredStaff([])
        }
      } catch (error) {
        console.error('Error loading users:', error)
        setStaff([])
        setFilteredStaff([])
        
        // Check if it's an auth error
        if (error.status === 401 || error.status === 403) {
          toast({
            title: "Authentication Error",
            description: "You don't have permission to view staff data",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load staff members. Please check if the backend is running.",
            variant: "destructive"
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [isAdmin, toast])

  useEffect(() => {
    // Filter staff based on search and filters
    let filtered = staff

    if (searchTerm) {
      filtered = filtered.filter(member => 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.isActive : !member.isActive
      )
    }

    setFilteredStaff(filtered)
  }, [searchTerm, roleFilter, statusFilter, staff])

  const handleToggleStatus = async (staffId) => {
    try {
      const member = staff.find(s => s._id === staffId)
      
      // Call the API to update the user status
      if (member.isActive) {
        await usersApi.deactivateUser(staffId)
      } else {
        await usersApi.reactivateUser(staffId)
      }
      
      // Update local state
      setStaff(prev => prev.map(member => 
        member._id === staffId 
          ? { ...member, isActive: !member.isActive }
          : member
      ))
      
      // Update filtered state as well
      setFilteredStaff(prev => prev.map(member => 
        member._id === staffId 
          ? { ...member, isActive: !member.isActive }
          : member
      ))
      
      toast({
        title: "Success",
        description: "Staff status updated",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive"
      })
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await usersApi.deactivateUser(staffId)
        
        // Update local state
        setStaff(prev => prev.map(member => 
          member._id === staffId 
            ? { ...member, isActive: false }
            : member
        ))
        
        // Update filtered state as well
        setFilteredStaff(prev => prev.map(member => 
          member._id === staffId 
            ? { ...member, isActive: false }
            : member
        ))
        
        toast({
          title: "Success",
          description: "Staff member deactivated",
          variant: "default"
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to deactivate staff member",
          variant: "destructive"
        })
        console.error('Error deactivating user:', error)
      }
    }
  }

  const handleUserAdded = (newUser) => {
    // Add new user to the staff list if they are a staff member
    if (newUser.role === USER_ROLES.STAFF) {
      // Make sure the user has an _id property for consistency
      const userWithId = newUser._id ? newUser : { ...newUser, _id: Date.now().toString() }
      
      setStaff(prev => [...prev, userWithId])
      setFilteredStaff(prev => [...prev, userWithId])
      
      toast({
        title: "Success",
        description: "New staff member added successfully",
        variant: "default"
      })
    }
  }

  if (loading) {
    return (
      <AdminProtection>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminProtection>
    )
  }

  return (
    <AdminProtection>
    <div className="space-y-4 p-4 lg:space-y-6 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Staff Management</h1>
          <p className="text-sm text-gray-600 sm:text-base">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!isAdmin}
          className={`${
            isAdmin 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } px-3 py-2 rounded-md flex items-center justify-center transition-colors text-sm sm:px-4 sm:text-base w-full sm:w-auto`}
          title={!isAdmin ? 'Only administrators can add new users' : 'Add new staff member'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
          {isAdmin && <Shield className="w-4 h-4 ml-2 text-blue-200" />}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="sm:col-span-2 lg:col-span-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
                setStatusFilter('all')
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 lg:w-8 lg:h-8" />
            <div className="ml-3 lg:ml-4">
              <p className="text-xs font-medium text-gray-600 lg:text-sm">Total Staff</p>
              <p className="text-lg font-bold text-gray-900 lg:text-2xl">{staff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-green-600 lg:w-8 lg:h-8" />
            <div className="ml-3 lg:ml-4">
              <p className="text-xs font-medium text-gray-600 lg:text-sm">Active</p>
              <p className="text-lg font-bold text-gray-900 lg:text-2xl">
                {staff.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-red-600 lg:w-8 lg:h-8" />
            <div className="ml-3 lg:ml-4">
              <p className="text-xs font-medium text-gray-600 lg:text-sm">Inactive</p>
              <p className="text-lg font-bold text-gray-900 lg:text-2xl">
                {staff.filter(s => !s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-600 lg:w-8 lg:h-8" />
            <div className="ml-3 lg:ml-4">
              <p className="text-xs font-medium text-gray-600 lg:text-sm">This Month</p>
              <p className="text-lg font-bold text-gray-900 lg:text-2xl">
                {staff.filter(s => {
                  const joinDate = new Date(s.createdAt)
                  const currentMonth = new Date().getMonth()
                  const currentYear = new Date().getFullYear()
                  return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 lg:px-6 lg:py-4">
          <h2 className="text-base font-semibold text-gray-900 lg:text-lg">
            Staff Members ({filteredStaff.length})
          </h2>
        </div>
        
        {/* Mobile-friendly list view */}
        <div className="lg:hidden">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first staff member to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {filteredStaff.map((member) => (
                <div key={member._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">{member.employeeId}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-2" />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-2" />
                        {member.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      Joined {formatDate(member.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleToggleStatus(member._id)}
                      className={`flex-1 py-2 px-3 text-xs rounded ${
                        member.isActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member._id)}
                      className="flex-1 py-2 px-3 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <Trash2 className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add your first staff member to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{member.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.department || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(member._id)}
                        className={`${
                          member.isActive
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member._id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
    </AdminProtection>
  )
} 