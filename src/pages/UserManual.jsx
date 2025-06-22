import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  BarChart3,
  Building2,
  UserCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wifi,
  FileText,
  Settings,
  Target,
  Timer,
  ClipboardList,
  TrendingUp,
  Bell
} from 'lucide-react'

export default function UserManual() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-xl">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SunCoop Staff Management System</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive Progressive Web Application (PWA) designed to streamline workforce management, 
          time tracking, and operational efficiency for modern businesses.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Purpose & Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What It Does:</h4>
                  <p className="text-gray-600">
                    SunCoop is a modern workforce management solution that digitizes and automates 
                    staff scheduling, time tracking, and administrative tasks across multiple business locations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Eliminates paper timesheets and manual scheduling</li>
                    <li>• Provides real-time location verification for clock-ins</li>
                    <li>• Generates automated reports and analytics</li>
                    <li>• Reduces administrative overhead by 60-80%</li>
                    <li>• Ensures labor law compliance and accurate payroll</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Who Uses This System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Staff Members</Badge>
                  <p className="text-sm text-gray-600 mb-3">
                    Employees use mobile-friendly interfaces to view schedules, clock in/out, 
                    and track their work hours across different locations.
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Managers & Administrators</Badge>
                  <p className="text-sm text-gray-600">
                    Supervisors access comprehensive dashboards to manage staff, create schedules, 
                    monitor performance, and generate business intelligence reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Staff Features */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Staff Member Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Dashboard</CardTitle>
                  <Badge variant="secondary" className="mt-1">Staff</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Centralized hub showing current status, upcoming shifts, and quick actions.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time work status and current shift information</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Weekly hours summary and performance metrics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Location verification status with GPS/WiFi indicators</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Quick access to clock in/out functionality</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Shift Management</CardTitle>
                  <Badge variant="secondary" className="mt-1">Staff</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage work schedules across all assigned locations.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Browse available shifts by date and location</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Book open shifts that match your availability</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View detailed shift information (time, location, requirements)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Cancel shifts with proper notice</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Time Tracking System</CardTitle>
                  <Badge variant="secondary" className="mt-1">Staff</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Accurate time recording with location verification and detailed reporting.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>One-tap clock in/out with location verification</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View complete work history with detailed breakdowns</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>GPS and WiFi verification for each clock event</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time hours calculation and overtime tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile & Settings</CardTitle>
                  <Badge variant="secondary" className="mt-1">Staff</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage personal information and account preferences.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Update contact information and emergency details</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View employment history and performance metrics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage notification preferences</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Access employee handbook and company policies</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Admin Features */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Administrator Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Management Dashboard</CardTitle>
                  <Badge variant="secondary" className="mt-1">Admin</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Comprehensive overview of workforce operations and key performance indicators.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time staff activity monitoring across all locations</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Key metrics: total staff, active shifts, monthly hours</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Performance alerts and system notifications</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Staff performance summaries and rankings</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Staff Management</CardTitle>
                  <Badge variant="secondary" className="mt-1">Admin</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Complete employee lifecycle management and administration.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Add, edit, and deactivate staff members</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Assign roles and permissions (Admin vs Staff)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage employee information and contact details</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track join dates, departments, and employee IDs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Advanced Shift Management</CardTitle>
                  <Badge variant="secondary" className="mt-1">Admin</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create, schedule, and optimize work shifts across multiple locations.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Create shifts with specific requirements and capacities</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Assign shifts to specific staff members</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Monitor shift coverage and identify gaps</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Handle shift cancellations and emergency coverage</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reports & Analytics</CardTitle>
                  <Badge variant="secondary" className="mt-1">Admin</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Generate comprehensive reports and business intelligence insights.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Labor cost analysis and budget forecasting</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Staff productivity and performance reports</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Location-based utilization statistics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Export data to Excel/CSV for further analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Location Verification */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Location Verification System</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                GPS Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ensures staff members are physically present at assigned work locations using precise GPS coordinates.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Accuracy within 5-25 meters of work location</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Prevents buddy punching and time theft</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Works both indoors and outdoors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Automatic detection and verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-green-600" />
                WiFi Network Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Secondary verification method using specific WiFi networks associated with each work location.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Validates connection to approved WiFi networks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Backup verification when GPS is unavailable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Works well in indoor environments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Additional security layer for time tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Try the Demo</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Administrator Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm space-y-2">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Full Access:</strong> Complete system management, all reports, staff oversight</p>
                  <p className="text-blue-700 font-medium">Use this account to explore all administrative features</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Staff Login Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm"><strong>sarah.chen</strong> - Senior staff member</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm"><strong>mike.johnson</strong> - Operations specialist</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm"><strong>emma.wilson</strong> - New team member</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm"><strong>alex.thompson</strong> - Experienced professional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-gray-200">
        <p className="text-gray-600">
          This comprehensive staff management system is designed to grow with your business, 
          providing scalable workforce solutions for organizations of all sizes.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Built with modern web technologies for reliability, security, and performance.
        </p>
      </div>
    </div>
  )
} 