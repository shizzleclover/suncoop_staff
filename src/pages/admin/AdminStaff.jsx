import { useState } from 'react'
import { Users, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import StaffApprovalComponent from '../../components/StaffApprovalComponent'
import StaffManagementComponent from '../../components/StaffManagementComponent'

export default function AdminStaff() {
  const [activeTab, setActiveTab] = useState('management')

  return (
    <div className="main-content">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Administration</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Manage staff members, approve new registrations, and handle staff accounts
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <StaffManagementComponent />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <StaffApprovalComponent />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
} 