import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Bell,
  Search,
  BookOpen,
  ChevronRight,
  Home,
  LogIn,
  UserPlus,
  CalendarPlus,
  MapPinIcon,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  PhoneCall,
  Mail,
  Key,
  PlusCircle
} from 'lucide-react'

export default function UserManual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  // Comprehensive feature sections
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      description: 'Learn the basics of using SunCoop Staff Management System',
      content: [
        {
          title: 'First Time Login',
          icon: <LogIn className="h-5 w-5 text-green-600" />,
          description: 'How to access the system for the first time',
          steps: [
            'Open your web browser and go to the SunCoop application URL',
            'For Admin setup: Click "Setup Organization" if no admin exists',
            'For Staff: Use the credentials provided by your administrator',
            'Enter your username or email and password',
            'Click "Sign In" to access your dashboard',
            'Change your password in Profile settings for security'
          ],
          tips: [
            'The system works on any device - phone, tablet, or computer',
            'Add the app to your home screen for quick access',
            'Use "Remember Me" on trusted devices'
          ]
        },
        {
          title: 'Understanding Your Dashboard',
          icon: <Home className="h-5 w-5 text-blue-600" />,
          description: 'Navigate your personalized dashboard',
          steps: [
            'Dashboard shows your most important information at a glance',
            'Staff see: upcoming shifts, time tracking status, recent activities',
            'Admins see: system overview, pending approvals, staff activity',
            'Quick actions are available for common tasks',
            'Notifications appear in the top-right corner'
          ],
          tips: [
            'Dashboard updates in real-time',
            'Click on cards for detailed views',
            'Use the sidebar menu to navigate'
          ]
        }
      ]
    },
    {
      id: 'staff-features',
      title: 'Staff Features',
      icon: <Users className="h-6 w-6 text-green-600" />,
      description: 'Everything staff members need to know about using the system',
      content: [
        {
          title: 'Managing Your Shifts',
          icon: <Calendar className="h-5 w-5 text-purple-600" />,
          description: 'View, book, and manage your work shifts',
          steps: [
            'Go to "Shifts" from the sidebar menu',
            'View "My Shifts" tab to see your assigned shifts',
            'Switch to "Available Shifts" to book additional shifts',
            'Use filters to find shifts by date, location, or status',
            'Click "Book Shift" on available shifts you want to work',
            'Cancel shifts at least 24 hours in advance'
          ],
          tips: [
            'Book shifts early - they go fast!',
            'Check requirements before booking',
            'Set up notifications for new shifts',
            'Contact admin if you need to cancel last-minute'
          ]
        },
        {
          title: 'Time Tracking',
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          description: 'Clock in/out and track your working hours',
          steps: [
            'Go to "Time Tracking" from the sidebar',
            'Click "Clock In" when you start work',
            'Ensure you\'re at the correct location',
            'Add notes about your work if needed',
            'Click "Clock Out" when you finish',
            'Review your time entries for accuracy',
            'Submit entries for approval by deadline'
          ],
          tips: [
            'Always clock in/out at the right location',
            'Add detailed notes for complex tasks',
            'Check your total hours regularly',
            'Contact admin for time corrections'
          ]
        },
        {
          title: 'Profile Management',
          icon: <UserCheck className="h-5 w-5 text-indigo-600" />,
          description: 'Update your personal information and preferences',
          steps: [
            'Click your profile picture or name in the header',
            'Select "Profile" from the dropdown menu',
            'Update your contact information as needed',
            'Change your password in the Security section',
            'Set your notification preferences',
            'Upload a profile picture (optional)',
            'Save changes when complete'
          ],
          tips: [
            'Keep contact info current for important updates',
            'Use a strong password with mixed characters',
            'Enable notifications for shift updates',
            'Profile picture helps colleagues recognize you'
          ]
        }
      ]
    },
    {
      id: 'admin-features',
      title: 'Admin Features',
      icon: <Shield className="h-6 w-6 text-red-600" />,
      description: 'Complete administrative tools for managing staff and operations',
      content: [
        {
          title: 'Staff Management',
          icon: <Users className="h-5 w-5 text-blue-600" />,
          description: 'Add, edit, and manage staff members',
          steps: [
            'Navigate to "Staff" in the admin sidebar',
            'Click "Add New Staff" to create accounts',
            'Fill in staff details: name, email, phone, role',
            'Set initial password or let system generate one',
            'Activate/deactivate staff accounts as needed',
            'Edit staff information by clicking the edit icon',
            'View staff activity and performance metrics'
          ],
          tips: [
            'Use clear naming conventions for usernames',
            'Assign appropriate roles (Staff/Admin)',
            'Regularly review and update staff information',
            'Deactivate rather than delete departed staff'
          ]
        },
        {
          title: 'Location Management',
          icon: <MapPin className="h-5 w-5 text-green-600" />,
          description: 'Set up and manage work locations',
          steps: [
            'Go to "Locations" in the admin menu',
            'Click "Add Location" to create new work sites',
            'Enter location details: name, address, type',
            'Set operating hours for each day',
            'Assign a location manager if needed',
            'Configure capacity and special requirements',
            'Add facilities and notes for staff reference'
          ],
          tips: [
            'Include clear directions in location notes',
            'Set realistic capacity limits',
            'Keep operating hours updated',
            'Use location types to organize sites'
          ]
        },
        {
          title: 'Shift Planning',
          icon: <CalendarPlus className="h-5 w-5 text-purple-600" />,
          description: 'Create and manage work shifts efficiently',
          steps: [
            'Access "Shifts" from the admin sidebar',
            'Use "Bulk Generator" for recurring shifts',
            'Set shift parameters: location, time, duration',
            'Choose days of the week for recurring shifts',
            'Preview generated shifts before creating',
            'Manually create individual shifts as needed',
            'Assign specific staff to shifts when required'
          ],
          tips: [
            'Plan shifts well in advance',
            'Consider staff availability and preferences',
            'Use bulk generation for regular schedules',
            'Leave some shifts unassigned for flexibility'
          ]
        },
        {
          title: 'Time & Attendance',
          icon: <Timer className="h-5 w-5 text-orange-600" />,
          description: 'Monitor and approve staff time entries',
          steps: [
            'Go to "Reports" to view time tracking data',
            'Review pending time entry approvals',
            'Check for late clock-ins or missing entries',
            'Approve or reject time entries with notes',
            'Export timesheet data for payroll',
            'Monitor real-time who\'s currently working',
            'Generate detailed time reports by period'
          ],
          tips: [
            'Review and approve entries promptly',
            'Investigate unusual time patterns',
            'Set clear time tracking policies',
            'Export data regularly for backup'
          ]
        },
        {
          title: 'Reports & Analytics',
          icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
          description: 'Access detailed reports and system analytics',
          steps: [
            'Navigate to "Reports" in the admin menu',
            'Choose report type: Staff, Shifts, Time, or Overview',
            'Set date ranges for the reports',
            'Apply filters by location, staff, or status',
            'View charts and graphs for visual insights',
            'Export reports as CSV or PDF files',
            'Schedule automated report delivery (if available)'
          ],
          tips: [
            'Review reports regularly for trends',
            'Use filters to focus on specific issues',
            'Compare periods to identify improvements',
            'Share relevant reports with management'
          ]
        },
        {
          title: 'System Settings',
          icon: <Settings className="h-5 w-5 text-gray-600" />,
          description: 'Configure system-wide settings and preferences',
          steps: [
            'Access "Settings" from the admin sidebar',
            'Configure notification preferences',
            'Set time tracking policies and rules',
            'Manage system-wide announcements',
            'Configure email and SMS settings',
            'Set up backup and security options',
            'Customize system appearance and branding'
          ],
          tips: [
            'Document all setting changes',
            'Test changes in a safe environment first',
            'Keep security settings up to date',
            'Regular backup of system settings'
          ]
        }
      ]
    },
    {
      id: 'mobile-app',
      title: 'Mobile App Features',
      icon: <Wifi className="h-6 w-6 text-blue-600" />,
      description: 'Using SunCoop as a Progressive Web App on mobile devices',
      content: [
        {
          title: 'Installing the Mobile App',
          icon: <Download className="h-5 w-5 text-green-600" />,
          description: 'Add SunCoop to your home screen for quick access',
          steps: [
            'Open SunCoop in your mobile browser (Chrome, Safari, etc.)',
            'Look for "Add to Home Screen" prompt or menu option',
            'On iPhone: Tap Share button → Add to Home Screen',
            'On Android: Tap menu (3 dots) → Add to Home Screen',
            'Name the app shortcut and confirm',
            'The app icon will appear on your home screen',
            'Tap the icon to open SunCoop like a native app'
          ],
          tips: [
            'Works offline for basic functions',
            'Receives push notifications when enabled',
            'Updates automatically in the background',
            'No app store download required'
          ]
        },
        {
          title: 'Mobile Time Tracking',
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          description: 'Clock in/out using your mobile device',
          steps: [
            'Open the SunCoop app on your phone',
            'Ensure location services are enabled',
            'Navigate to Time Tracking section',
            'Tap "Clock In" when arriving at work',
            'Allow location access for verification',
            'Add notes about your tasks if required',
            'Tap "Clock Out" when leaving work',
            'Verify your time entry is recorded correctly'
          ],
          tips: [
            'Enable location services for accurate tracking',
            'Clock in/out only from authorized locations',
            'Check network connection for sync',
            'Contact admin if having location issues'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      description: 'Common issues and their solutions',
      content: [
        {
          title: 'Login Problems',
          icon: <Key className="h-5 w-5 text-red-600" />,
          description: 'Can\'t access your account?',
          steps: [
            'Double-check your username/email and password',
            'Ensure Caps Lock is off',
            'Try resetting your password using "Forgot Password"',
            'Clear your browser cache and cookies',
            'Try a different browser or incognito mode',
            'Check if your account has been deactivated',
            'Contact your administrator for help'
          ],
          tips: [
            'Use password manager for secure storage',
            'Never share login credentials',
            'Change password if you suspect compromise',
            'Keep recovery email address current'
          ]
        },
        {
          title: 'Time Tracking Issues',
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          description: 'Problems with clocking in/out?',
          steps: [
            'Check your internet connection',
            'Ensure you\'re at the correct location',
            'Enable location services in your browser/device',
            'Clear browser cache and reload the page',
            'Try using a different device or browser',
            'Check if you\'re already clocked in elsewhere',
            'Contact admin to manually adjust time entries'
          ],
          tips: [
            'Always verify successful clock in/out',
            'Screenshot confirmation for records',
            'Report location issues immediately',
            'Keep backup time records manually'
          ]
        },
        {
          title: 'Notification Problems',
          icon: <Bell className="h-5 w-5 text-blue-600" />,
          description: 'Not receiving important notifications?',
          steps: [
            'Check notification settings in your profile',
            'Enable browser notifications when prompted',
            'Check your email spam/junk folder',
            'Verify your email address is correct',
            'Update your phone number for SMS alerts',
            'Check device notification settings',
            'Try logging out and back in'
          ],
          tips: [
            'Test notifications with a colleague',
            'Keep contact information updated',
            'Check notification preferences regularly',
            'Report missing critical notifications'
          ]
        }
      ]
    }
  ];

  // Filter sections based on search term
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.tips.some(tip => tip.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const handleSectionClick = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">
            SunCoop User Manual
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Complete guide to using the SunCoop Staff Management System
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for features, guides, or help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-0"
            />
          </div>
        </div>

        {/* Quick Navigation */}
        {!searchTerm && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 px-4">
              Quick Navigation
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                    activeSection === section.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2">{section.icon}</div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                      {section.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => handleSectionClick(section.id)}
                className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {section.icon}
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </button>

              {activeSection === section.id && (
                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                  <div className="grid gap-6 lg:gap-8">
                    {section.content.map((item, itemIndex) => (
                      <Card key={itemIndex} className="shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                            {item.icon}
                            {item.title}
                          </CardTitle>
                          <p className="text-sm sm:text-base text-gray-600">
                            {item.description}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-3">
                              Step-by-Step Guide:
                            </h4>
                            <ol className="space-y-2">
                              {item.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {step}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-3">
                              💡 Pro Tips:
                            </h4>
                            <ul className="space-y-2">
                              {item.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-3">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {tip}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo Credentials Section */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            🚀 Try the Demo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Shield className="h-5 w-5" />
                  Administrator Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base"><strong>Username:</strong> admin</p>
                    <p className="text-sm sm:text-base"><strong>Access Level:</strong> Complete system management</p>
                    <p className="text-blue-700 font-medium text-sm sm:text-base">
                      Explore all administrative features including staff management, reporting, and system settings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <UserCheck className="h-5 w-5" />
                  Staff Login Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { username: 'sarah.chen', role: 'Senior staff member' },
                    { username: 'mike.johnson', role: 'Operations specialist' },
                    { username: 'emma.wilson', role: 'New team member' },
                    { username: 'alex.thompson', role: 'Experienced professional' }
                  ].map((staff, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm sm:text-base">
                        <strong>{staff.username}</strong> - {staff.role}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 sm:mt-12 text-center bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Need More Help?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of SunCoop.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
              <Mail className="h-4 w-4" />
              <span>support@suncoop.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
              <PhoneCall className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center border-t border-gray-200 pt-6 sm:pt-8">
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            SunCoop Staff Management System - Built for the modern workforce
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Progressive Web App technology ensures reliable performance across all devices
          </p>
        </div>
      </div>
    </div>
  );
}