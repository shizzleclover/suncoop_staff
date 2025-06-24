import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  Phone,
  Mail,
  Users,
  Filter,
  MoreVertical,
  Activity,
  Shield
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../hooks/use-toast'
import { locationsApi } from '../../lib/api'
import AddLocationModal from '../../components/AddLocationModal'
import AdminProtection from '../../components/AdminProtection'

export default function AdminLocations() {
  const { toast } = useToast()
  const [locations, setLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    // Filter locations based on search and filters
    let filtered = locations

    if (searchTerm) {
      filtered = filtered.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(location => location.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(location => 
        statusFilter === 'active' ? location.isActive : !location.isActive
      )
    }

    setFilteredLocations(filtered)
  }, [searchTerm, typeFilter, statusFilter, locations])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const response = await locationsApi.getLocations()
      
      if (response.success && response.data.locations) {
        setLocations(response.data.locations)
        setFilteredLocations(response.data.locations)
      } else {
        setLocations([])
        setFilteredLocations([])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationAdded = (newLocation) => {
    setLocations(prev => [...prev, newLocation])
    setShowAddModal(false)
    toast({
      title: "Success",
      description: "Location added successfully",
    })
  }

  const handleToggleStatus = async (locationId) => {
    try {
      const location = locations.find(l => l._id === locationId)
      
      if (location.isActive) {
        await locationsApi.deactivateLocation(locationId)
      } else {
        await locationsApi.activateLocation(locationId)
      }
      
      // Update local state
      setLocations(prev => prev.map(location => 
        location._id === locationId 
          ? { ...location, isActive: !location.isActive }
          : location
      ))
      
      toast({
        title: "Success",
        description: "Location status updated",
      })
    } catch (error) {
      console.error('Error updating location status:', error)
      toast({
        title: "Error",
        description: "Failed to update location status",
        variant: "destructive"
      })
    }
  }



  const getLocationTypes = () => {
    const types = [...new Set(locations.map(location => location.type))]
    return types.filter(Boolean)
  }

  const getTypeColor = (type) => {
    const colors = {
      'Office': 'bg-blue-100 text-blue-800',
      'Branch': 'bg-green-100 text-green-800',
      'Retail': 'bg-purple-100 text-purple-800',
      'Corporate': 'bg-orange-100 text-orange-800',
      'Warehouse': 'bg-gray-100 text-gray-800',
      'Remote': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: locations.length,
    active: locations.filter(l => l.isActive).length,
    inactive: locations.filter(l => !l.isActive).length,
    types: getLocationTypes().length
  }

  if (loading) {
    return (
      <AdminProtection>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
              <p className="text-gray-600">Manage your work locations</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
            <p className="text-gray-600">Manage your work locations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Location Types</p>
                <p className="text-2xl font-bold text-gray-900">{stats.types}</p>
              </div>
            </div>
          </div>


        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getLocationTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('all')
                setStatusFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Locations List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Locations ({filteredLocations.length})
            </h2>
          </div>
          
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first location to get started.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <div key={location._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {location.name}
                          </h3>
                          <Badge className={getTypeColor(location.type)}>
                            {location.type}
                          </Badge>
                          <Badge variant={location.isActive ? "default" : "secondary"}>
                            {location.isActive ? "Active" : "Inactive"}
                          </Badge>

                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {location.address}, {location.city}
                            {location.state && `, ${location.state}`}
                          </div>
                          
                          {location.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {location.contactPhone}
                            </div>
                          )}
                          
                          {location.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {location.contactEmail}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Capacity: {location.capacity}
                          </div>


                        </div>
                        
                        {location.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {location.description}
                          </p>
                        )}


                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(location._id)}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          {location.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLocationAdded={handleLocationAdded}
      />
    </AdminProtection>
  )
} 