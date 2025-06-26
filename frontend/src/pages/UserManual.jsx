import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Separator } from '../components/ui/separator'
import { 
  Calendar, 
  MapPin, 
  User, 
  Settings,
  Phone,
  Mail,
  AlertCircle,
  Search,
  Building2,
  LogIn,
  Timer,
  Bell,
  Shield,
  UserCheck,
  Home,
  Book,
  Smartphone,
  Wifi,
  Battery,
  HelpCircle,
  Info,
  Star,
  ChevronDown,
  ChevronUp,
  Navigation,
  Camera,
  Download,
  Users,
  BarChart3,
  Cog,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  Database,
  Activity,
  Globe,
  Lock,
  Zap,
  Target,
  Crown,
  Briefcase,
  PieChart,
  RefreshCw,
  Archive,
  UserX,
  MapPinIcon,
  ClipboardList,
  MessageSquare,
  Sliders
} from 'lucide-react'

const UserManual = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('')

  const sections = [
    {
      id: 'getting-started',
      title: "🚀 Getting Started as Admin",
      icon: <Crown className="h-5 w-5" />,
      description: "Master admin access and understand your comprehensive dashboard",
      content: [
        {
          subtitle: "First Time Admin Login",
          icon: <LogIn className="h-4 w-4 text-green-600" />,
          description: "Access your administrative dashboard and understand admin privileges",
          steps: [
            "Login with your admin credentials provided during system setup",
            "Notice the expanded navigation menu with admin-only sections",
            "Your dashboard shows system-wide statistics and all user activities",
            "Admin badge appears next to your name confirming elevated privileges",
            "Explore each section: Staff, Shifts, Locations, Reports, and Settings",
            "Set up your admin profile with contact information and preferences"
          ],
          tips: [
            "Admin accounts have full system access - use responsibly",
            "Your actions are logged for audit and security purposes",
            "Admin dashboard shows real-time data across all locations",
            "Bookmark the admin dashboard for quick daily access"
          ]
        },
        {
          subtitle: "Understanding the Admin Dashboard",
          icon: <BarChart3 className="h-4 w-4 text-blue-600" />,
          description: "Navigate your comprehensive administrative control center",
          steps: [
            "View total staff count, active shifts, and system-wide metrics",
            "Monitor today's activities across all locations in real-time",
            "Check recent staff activities, time entries, and system alerts",
            "Access quick actions for common admin tasks like adding staff",
            "Review upcoming shifts requiring attention or approval",
            "Use dashboard filters to focus on specific locations or time periods"
          ],
          tips: [
            "Dashboard cards are clickable for detailed views",
            "Use the refresh button to update real-time data",
            "Dashboard widgets can be customized in Settings",
            "Critical alerts appear prominently at the top"
          ]
        },
        {
          subtitle: "Admin Navigation & Permissions",
          icon: <Shield className="h-4 w-4 text-purple-600" />,
          description: "Master the administrative interface and understand your capabilities",
          steps: [
            "Navigate using the expanded sidebar with admin-only sections",
            "Access Staff Management to control user accounts and permissions",
            "Use Shift Management for bulk operations and scheduling",
            "Visit Locations to manage work sites and geographic data",
            "Check Reports for comprehensive analytics and insights",
            "Configure system-wide Settings and company preferences"
          ],
          tips: [
            "Admin sections are clearly marked with distinctive icons",
            "Some actions require confirmation for security",
            "Help tooltips appear when hovering over complex features",
            "Admin features may have additional loading time due to data complexity"
          ]
        }
      ]
    },
    {
      id: 'staff-management',
      title: "👥 Staff Management",
      icon: <Users className="h-5 w-5" />,
      description: "Complete control over staff accounts, roles, and permissions",
      content: [
        {
          subtitle: "Adding New Staff Members",
          icon: <UserPlus className="h-4 w-4 text-green-600" />,
          description: "Create and configure new staff accounts with proper access levels",
          steps: [
            "Go to Admin > Staff and click 'Add New Staff Member'",
            "Enter complete personal information: name, email, phone number",
            "Set initial password (staff can change on first login)",
            "Assign role: Staff, Team Lead, Supervisor, or Admin",
            "Configure availability preferences and location assignments",
            "Enable/disable account status and notification preferences",
            "Save and optionally send welcome email with login credentials"
          ],
          tips: [
            "Use professional email addresses for better communication",
            "Start with basic Staff role and promote as needed",
            "Document emergency contact information thoroughly",
            "Consider location assignments based on staff residence"
          ]
        },
        {
          subtitle: "Managing Existing Staff",
          icon: <Edit className="h-4 w-4 text-blue-600" />,
          description: "Edit profiles, update permissions, and manage staff lifecycle",
          steps: [
            "View all staff in the Staff Management table with filters",
            "Click on any staff member to view detailed profile",
            "Edit personal information, contact details, and emergency contacts",
            "Update role assignments and permission levels",
            "Modify location access and availability preferences",
            "Deactivate accounts for departing staff (preserves data)",
            "Reset passwords when staff report access issues"
          ],
          tips: [
            "Deactivating preserves historical data better than deletion",
            "Role changes take effect immediately upon saving",
            "Keep staff profiles updated for accurate contact in emergencies",
            "Use bulk actions for managing multiple staff members"
          ]
        },
        {
          subtitle: "Staff Performance & Analytics",
          icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
          description: "Monitor staff performance, hours, and engagement metrics",
          steps: [
            "Access individual staff performance dashboards",
            "Review total hours worked, shifts completed, and attendance rates",
            "Check punctuality metrics and location compliance",
            "Monitor shift booking patterns and preferred locations",
            "View time tracking accuracy and any discrepancies",
            "Generate individual performance reports for reviews"
          ],
          tips: [
            "Use performance data for scheduling and promotion decisions",
            "Address attendance issues early with direct communication",
            "Recognize high-performing staff to boost morale",
            "Performance metrics help identify training needs"
          ]
        },
        {
          subtitle: "Bulk Staff Operations",
          icon: <RefreshCw className="h-4 w-4 text-orange-600" />,
          description: "Efficiently manage multiple staff members simultaneously",
          steps: [
            "Use checkboxes to select multiple staff members",
            "Apply bulk actions: update locations, roles, or status",
            "Send group notifications or announcements",
            "Export staff data for external systems or backups",
            "Import staff data from CSV files for large additions",
            "Bulk password resets for security or onboarding"
          ],
          tips: [
            "Test bulk operations on a small group first",
            "Bulk imports should follow the provided CSV template",
            "Verify data accuracy before confirming bulk changes",
            "Consider timing of bulk communications to avoid disruption"
          ]
        }
      ]
    },
    {
      id: 'shift-management',
      title: "📅 Advanced Shift Management",
      icon: <Calendar className="h-5 w-5" />,
      description: "Master bulk shift creation, scheduling, and advanced shift operations",
      content: [
        {
          subtitle: "Bulk Shift Generator",
          icon: <Zap className="h-4 w-4 text-green-600" />,
          description: "Efficiently create multiple shifts using the powerful generator tool",
          steps: [
            "Navigate to Admin > Shifts and click 'Generate Bulk Shifts'",
            "Set date range for shift creation (weeks or months)",
            "Select locations where shifts will be available",
            "Configure shift patterns: daily, weekly, or custom schedules",
            "Set shift duration, break times, and staff requirements",
            "Preview generated shifts before creating (shows count and details)",
            "Confirm creation and monitor progress in the activity log"
          ],
          tips: [
            "Preview feature prevents accidental over-creation of shifts",
            "Consider peak business hours when setting shift times",
            "Account for travel time between locations for staff",
            "Generate shifts in smaller batches for complex schedules"
          ]
        },
        {
          subtitle: "Individual Shift Management",
          icon: <Edit className="h-4 w-4 text-blue-600" />,
          description: "Create, modify, and manage individual shifts with precision",
          steps: [
            "Create single shifts with specific requirements and details",
            "Edit existing shifts: time, location, requirements, or notes",
            "Cancel shifts and automatically notify assigned staff",
            "Reassign shifts between staff members when needed",
            "Add special instructions or requirements to shifts",
            "Monitor shift status: Available, Booked, In Progress, Completed"
          ],
          tips: [
            "Edit shifts at least 24 hours before start time when possible",
            "Include clear instructions for complex or new locations",
            "Use shift notes for special equipment or task requirements",
            "Cancellations should include reason for staff communication"
          ]
        },
        {
          subtitle: "Shift Monitoring & Oversight",
          icon: <Eye className="h-4 w-4 text-purple-600" />,
          description: "Monitor active shifts and ensure smooth operations",
          steps: [
            "View real-time shift status across all locations",
            "Monitor staff clock-in/out times and location compliance",
            "Receive alerts for late arrivals or no-shows",
            "Track shift completion rates and staff performance",
            "Manage shift disputes or time entry corrections",
            "Generate shift reports for payroll and analysis"
          ],
          tips: [
            "Set up alerts for critical shift issues",
            "Address no-shows immediately to maintain service levels",
            "Use location tracking data to verify staff presence",
            "Document any incidents or unusual circumstances"
          ]
        },
        {
          subtitle: "Clear All Shifts Function",
          icon: <Archive className="h-4 w-4 text-red-600" />,
          description: "Safely remove all shifts for system resets or major schedule changes",
          steps: [
            "Navigate to Admin > Shifts page",
            "Click the red 'Clear All Shifts' button (only visible to admins)",
            "Read all warnings about permanent data deletion carefully",
            "Type 'DELETE ALL SHIFTS' exactly in the confirmation field",
            "Review the count of shifts that will be deleted",
            "Confirm deletion - this action cannot be undone",
            "Monitor system logs for completion confirmation"
          ],
          tips: [
            "This action is irreversible - use extreme caution",
            "Consider exporting shift data before clearing for backup",
            "Notify all staff about schedule changes in advance",
            "Use only for major system resets or complete schedule overhauls"
          ]
        }
      ]
    },
    {
      id: 'location-management',
      title: "🗺️ Location Management",
      icon: <MapPin className="h-5 w-5" />,
      description: "Manage work locations, GPS boundaries, and geographic settings",
      content: [
        {
          subtitle: "Adding & Configuring Locations",
          icon: <Plus className="h-4 w-4 text-green-600" />,
          description: "Set up new work locations with precise geographic boundaries",
          steps: [
            "Go to Admin > Locations and click 'Add New Location'",
            "Enter location name, full address, and contact information",
            "Set GPS coordinates for accurate location detection",
            "Define geofence radius for clock-in/out boundaries",
            "Add special instructions or safety requirements",
            "Upload location photos or maps for staff reference",
            "Configure location-specific settings and access hours"
          ],
          tips: [
            "Test GPS coordinates by visiting the location with the app",
            "Set geofence radius considering building size and GPS accuracy",
            "Include parking instructions and building access codes",
            "Regular location audits ensure accuracy and safety"
          ]
        },
        {
          subtitle: "Location Analytics & Monitoring",
          icon: <Activity className="h-4 w-4 text-blue-600" />,
          description: "Track location usage, popular sites, and performance metrics",
          steps: [
            "View location utilization rates and staff preferences",
            "Monitor check-in accuracy and GPS compliance",
            "Track which locations have the most shift activity",
            "Analyze travel patterns and staff location efficiency",
            "Identify locations with frequent GPS or access issues",
            "Generate location-specific reports for management"
          ],
          tips: [
            "High-traffic locations may need more frequent shifts",
            "Poor GPS performance may indicate need for boundary adjustment",
            "Staff feedback helps improve location data quality",
            "Location analytics inform strategic business decisions"
          ]
        },
        {
          subtitle: "Location Maintenance & Updates",
          icon: <Settings className="h-4 w-4 text-orange-600" />,
          description: "Keep location data current and resolve access issues",
          steps: [
            "Regularly update addresses and contact information",
            "Adjust GPS boundaries based on staff feedback",
            "Update access instructions and security procedures",
            "Modify operating hours and availability windows",
            "Archive or deactivate closed locations",
            "Merge duplicate or redundant location entries"
          ],
          tips: [
            "Quarterly location reviews maintain data accuracy",
            "Staff input is valuable for identifying location issues",
            "Keep emergency contact information current",
            "Document any location-specific hazards or requirements"
          ]
        }
      ]
    },
    {
      id: 'reports-analytics',
      title: "📊 Reports & Analytics",
      icon: <FileText className="h-5 w-5" />,
      description: "Generate insights and comprehensive reports for business intelligence",
      content: [
        {
          subtitle: "Staff Performance Reports",
          icon: <TrendingUp className="h-4 w-4 text-green-600" />,
          description: "Analyze individual and team performance metrics",
          steps: [
            "Navigate to Admin > Reports > Staff Performance",
            "Select date range and specific staff members or teams",
            "Choose metrics: hours worked, attendance rate, punctuality",
            "Add location-based filters for site-specific analysis",
            "Generate detailed reports with charts and summaries",
            "Export reports as PDF or CSV for external sharing",
            "Schedule automated reports for regular delivery"
          ],
          tips: [
            "Monthly reports help identify performance trends",
            "Use reports for performance reviews and feedback",
            "Compare performance across different locations",
            "Identify top performers for recognition and development"
          ]
        },
        {
          subtitle: "Financial & Payroll Reports",
          icon: <DollarSign className="h-4 w-4 text-blue-600" />,
          description: "Generate payroll data and financial analytics",
          steps: [
            "Access payroll reports with total hours and calculated pay",
            "Filter by pay period, department, or individual staff",
            "Review overtime hours and premium pay calculations",
            "Generate detailed timesheets for payroll processing",
            "Export data in formats compatible with payroll systems",
            "Audit time entries for accuracy and policy compliance"
          ],
          tips: [
            "Run payroll reports before each pay period deadline",
            "Verify overtime calculations against company policy",
            "Cross-reference with time tracking data for accuracy",
            "Keep archived reports for annual tax and audit purposes"
          ]
        },
        {
          subtitle: "Operational Analytics",
          icon: <PieChart className="h-4 w-4 text-purple-600" />,
          description: "Understand business operations through data insights",
          steps: [
            "Analyze shift coverage and utilization rates across locations",
            "Monitor booking patterns and staff scheduling preferences",
            "Track no-show rates and operational disruptions",
            "Evaluate location performance and service delivery",
            "Identify peak times and staffing optimization opportunities",
            "Generate executive summaries for management reporting"
          ],
          tips: [
            "Operational data helps optimize scheduling efficiency",
            "Identify patterns to improve staff satisfaction",
            "Use insights to make data-driven business decisions",
            "Regular reporting helps spot trends before they become issues"
          ]
        },
        {
          subtitle: "Custom Report Builder",
          icon: <Sliders className="h-4 w-4 text-orange-600" />,
          description: "Create specialized reports tailored to specific business needs",
          steps: [
            "Use the report builder to combine multiple data sources",
            "Select from available fields: staff, shifts, locations, time tracking",
            "Apply custom filters and date ranges",
            "Choose visualization types: tables, charts, or graphs",
            "Save report templates for repeated use",
            "Share reports with specific team members or stakeholders"
          ],
          tips: [
            "Start with pre-built templates and customize as needed",
            "Complex reports may take longer to generate",
            "Save frequently used reports as templates",
            "Test reports with small data sets before full runs"
          ]
        }
      ]
    },
    {
      id: 'time-tracking-admin',
      title: "⏰ Time Tracking Administration",
      icon: <Clock className="h-5 w-5" />,
      description: "Manage, approve, and audit all staff time tracking data",
      content: [
        {
          subtitle: "Time Entry Review & Approval",
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          description: "Review and approve staff time entries for payroll accuracy",
          steps: [
            "Access Admin > Time Tracking to see all pending entries",
            "Review entries for accuracy: times, locations, and notes",
            "Approve accurate entries with a single click or bulk approval",
            "Flag suspicious entries for investigation or staff clarification",
            "Reject incorrect entries with detailed explanations",
            "Process corrections and resubmissions from staff",
            "Monitor approval workflow and pending entry counts"
          ],
          tips: [
            "Set approval deadlines to ensure timely payroll processing",
            "Look for patterns in time discrepancies",
            "Communicate with staff about common time entry errors",
            "Use bulk approval for routine, accurate entries"
          ]
        },
        {
          subtitle: "Manual Time Entry Corrections",
          icon: <Edit className="h-4 w-4 text-blue-600" />,
          description: "Handle time corrections and resolve tracking issues",
          steps: [
            "Access individual staff time records for detailed review",
            "Make corrections for technical issues or missed clock-ins",
            "Add manual entries for work performed without proper tracking",
            "Document reasons for all manual adjustments",
            "Notify staff of corrections and maintain transparent communication",
            "Audit trail shows all changes for compliance and security"
          ],
          tips: [
            "Require staff explanation for all manual correction requests",
            "Document technical issues that prevent proper tracking",
            "Set limits on how far back corrections can be made",
            "Regular system maintenance reduces need for manual corrections"
          ]
        },
        {
          subtitle: "Location & GPS Compliance",
          icon: <MapPinIcon className="h-4 w-4 text-purple-600" />,
          description: "Monitor location accuracy and investigate compliance issues",
          steps: [
            "Review GPS data for all clock-in/out events",
            "Identify patterns of location non-compliance",
            "Investigate staff working outside designated areas",
            "Adjust location boundaries based on legitimate access needs",
            "Generate compliance reports for management review",
            "Address repeated violations through staff counseling"
          ],
          tips: [
            "Poor GPS accuracy may indicate technical rather than compliance issues",
            "Work with staff to understand legitimate boundary concerns",
            "Regular boundary audits improve system accuracy",
            "Clear policies help staff understand compliance expectations"
          ]
        },
        {
          subtitle: "Time Tracking System Settings",
          icon: <Cog className="h-4 w-4 text-orange-600" />,
          description: "Configure time tracking rules and system parameters",
          steps: [
            "Set company-wide time tracking policies and rules",
            "Configure overtime thresholds and premium pay calculations",
            "Define grace periods for late clock-ins and early departures",
            "Set automatic approval rules for routine time entries",
            "Configure location detection sensitivity and boundaries",
            "Establish audit retention periods for compliance"
          ],
          tips: [
            "Align system settings with company HR policies",
            "Test setting changes with small groups before company-wide deployment",
            "Document all policy changes for staff communication",
            "Regular policy reviews ensure continued relevance"
          ]
        }
      ]
    },
    {
      id: 'system-settings',
      title: "⚙️ System Settings & Configuration",
      icon: <Settings className="h-5 w-5" />,
      description: "Configure system-wide settings and company preferences",
      content: [
        {
          subtitle: "Company Information & Branding",
          icon: <Building2 className="h-4 w-4 text-green-600" />,
          description: "Set up company identity and system branding",
          steps: [
            "Navigate to Admin > Settings > Company Information",
            "Update company name, address, and contact information",
            "Upload company logo for header and login screen",
            "Set company colors and branding theme",
            "Configure time zone and regional settings",
            "Set default language and currency preferences",
            "Update legal and compliance information"
          ],
          tips: [
            "Consistent branding improves user experience",
            "Ensure contact information is current for emergencies",
            "Test branding changes on different devices",
            "Regular information updates maintain professional appearance"
          ]
        },
        {
          subtitle: "User Permissions & Security",
          icon: <Lock className="h-4 w-4 text-red-600" />,
          description: "Manage security settings and access controls",
          steps: [
            "Configure password complexity requirements",
            "Set session timeout and security policies",
            "Manage admin privileges and role definitions",
            "Configure two-factor authentication settings",
            "Set data retention and privacy policies",
            "Review audit logs and security events",
            "Configure backup and data recovery procedures"
          ],
          tips: [
            "Strong security policies protect sensitive staff data",
            "Regular security reviews identify potential vulnerabilities",
            "Balance security with user experience",
            "Train staff on security best practices"
          ]
        },
        {
          subtitle: "Notification & Communication Settings",
          icon: <Bell className="h-4 w-4 text-blue-600" />,
          description: "Configure system notifications and communication preferences",
          steps: [
            "Set up email server configuration for system notifications",
            "Configure notification templates for different events",
            "Set escalation rules for critical alerts",
            "Customize notification frequency and timing",
            "Configure SMS settings if available",
            "Set up automated reminders for shifts and deadlines",
            "Test notification delivery across different channels"
          ],
          tips: [
            "Test notifications regularly to ensure delivery",
            "Customize templates to match company tone",
            "Consider time zones when scheduling automated notifications",
            "Provide opt-out options for non-critical notifications"
          ]
        },
        {
          subtitle: "Integration & API Settings",
          icon: <Globe className="h-4 w-4 text-purple-600" />,
          description: "Configure external integrations and API access",
          steps: [
            "Set up payroll system integration if available",
            "Configure HR system data synchronization",
            "Manage API keys and external service connections",
            "Set up backup and data export procedures",
            "Configure third-party service integrations",
            "Monitor integration health and data flow",
            "Manage webhook endpoints and event notifications"
          ],
          tips: [
            "Test integrations thoroughly before production use",
            "Monitor integration performance regularly",
            "Keep API credentials secure and rotate regularly",
            "Document integration procedures for maintenance"
          ]
        }
      ]
    },
    {
      id: 'troubleshooting-admin',
      title: "🔧 Admin Troubleshooting",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Resolve system issues and provide technical support",
      content: [
        {
          subtitle: "Common Staff Issues",
          icon: <UserX className="h-4 w-4 text-red-600" />,
          description: "Quickly resolve the most frequent staff-reported problems",
          steps: [
            "Login problems: Reset passwords, check account status, verify email",
            "Clock-in issues: Check location boundaries, GPS settings, device permissions",
            "Shift booking problems: Verify account status, check shift availability",
            "Time tracking discrepancies: Review GPS data, check for technical issues",
            "Notification problems: Verify contact info, check notification settings",
            "App performance: Guide staff through cache clearing and updates"
          ],
          tips: [
            "Keep a troubleshooting log to identify recurring issues",
            "Screenshots from staff help diagnose problems quickly",
            "Test fixes from the staff perspective before confirming resolution",
            "Document solutions for future reference and staff training"
          ]
        },
        {
          subtitle: "System Performance Issues",
          icon: <Activity className="h-4 w-4 text-orange-600" />,
          description: "Diagnose and resolve system-wide performance problems",
          steps: [
            "Monitor system response times and identify bottlenecks",
            "Check database performance and optimize queries if needed",
            "Review server resources and scale as necessary",
            "Analyze user load patterns and plan for peak usage",
            "Clear system caches and restart services if required",
            "Monitor third-party service status and integration health"
          ],
          tips: [
            "Proactive monitoring prevents many performance issues",
            "Peak usage times often coincide with shift changes",
            "Keep system requirements documented for scaling decisions",
            "Regular maintenance prevents most performance problems"
          ]
        },
        {
          subtitle: "Data Issues & Recovery",
          icon: <Database className="h-4 w-4 text-blue-600" />,
          description: "Handle data corruption, loss, or synchronization problems",
          steps: [
            "Identify data inconsistencies through regular audits",
            "Use backup procedures to recover lost or corrupted data",
            "Resolve synchronization issues between different system components",
            "Investigate and correct duplicate or missing records",
            "Verify data integrity after system updates or maintenance",
            "Document data issues and implement preventive measures"
          ],
          tips: [
            "Regular automated backups are essential for data recovery",
            "Data validation rules prevent many corruption issues",
            "Test recovery procedures regularly to ensure they work",
            "Keep detailed logs of all data modifications"
          ]
        },
        {
          subtitle: "Integration & External Service Issues",
          icon: <Globe className="h-4 w-4 text-purple-600" />,
          description: "Troubleshoot problems with external services and integrations",
          steps: [
            "Monitor API connection status and error rates",
            "Verify authentication credentials and permissions",
            "Check external service status and known issues",
            "Test data synchronization and resolve conflicts",
            "Update integration settings and endpoints as needed",
            "Implement fallback procedures for service outages"
          ],
          tips: [
            "External service issues often require vendor communication",
            "Keep alternative procedures ready for critical integrations",
            "Monitor vendor status pages for known issues",
            "Document integration dependencies and contact information"
          ]
        }
      ]
    },
    {
      id: 'best-practices',
      title: "⭐ Admin Best Practices",
      icon: <Target className="h-5 w-5" />,
      description: "Expert tips for effective system administration and management",
      content: [
        {
          subtitle: "Daily Admin Routine",
          icon: <ClipboardList className="h-4 w-4 text-green-600" />,
          description: "Establish efficient daily workflows for consistent system management",
          steps: [
            "Start each day by reviewing dashboard alerts and notifications",
            "Check overnight time entries for approval or issues",
            "Monitor today's shift coverage and address any gaps",
            "Review staff activity and investigate any unusual patterns",
            "Process pending time corrections and staff requests",
            "Update system announcements or communications as needed",
            "End day by reviewing completion metrics and planning tomorrow"
          ],
          tips: [
            "Consistent daily routines prevent small issues from becoming major problems",
            "Use dashboard filters to focus on priority items first",
            "Set aside dedicated time for staff communication and support",
            "Document recurring issues to identify system improvement opportunities"
          ]
        },
        {
          subtitle: "Staff Communication Strategies",
          icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
          description: "Build effective communication practices with your staff",
          steps: [
            "Send regular updates about schedule changes and system improvements",
            "Use multiple communication channels: in-app, email, and direct contact",
            "Provide clear instructions and documentation for new features",
            "Respond promptly to staff questions and technical issues",
            "Create feedback loops to understand staff needs and concerns",
            "Recognition programs boost morale and engagement",
            "Maintain open communication about company policies and changes"
          ],
          tips: [
            "Clear communication reduces support requests and improves satisfaction",
            "Regular feedback helps identify training needs and system improvements",
            "Personalized communication shows staff they are valued",
            "Transparent policies build trust and compliance"
          ]
        },
        {
          subtitle: "Security & Compliance",
          icon: <Shield className="h-4 w-4 text-red-600" />,
          description: "Maintain robust security practices and regulatory compliance",
          steps: [
            "Regularly review and update user access permissions",
            "Monitor system access logs for unusual activity",
            "Ensure data backup procedures are tested and current",
            "Keep software and security updates applied promptly",
            "Train staff on security best practices and password policies",
            "Conduct periodic security audits and vulnerability assessments",
            "Maintain compliance with labor laws and data protection regulations"
          ],
          tips: [
            "Security is an ongoing process, not a one-time setup",
            "Document all security procedures for consistency",
            "Regular training keeps security awareness high",
            "Compliance requirements may change - stay informed"
          ]
        },
        {
          subtitle: "Performance Optimization",
          icon: <Zap className="h-4 w-4 text-purple-600" />,
          description: "Optimize system performance and user experience",
          steps: [
            "Monitor system usage patterns and optimize during peak times",
            "Regularly clean up old data and archive unnecessary records",
            "Optimize location boundaries based on staff feedback and GPS accuracy",
            "Review and streamline workflows to reduce complexity",
            "Train staff on efficient app usage to reduce support needs",
            "Plan system updates and maintenance during low-usage periods",
            "Continuously evaluate and improve business processes"
          ],
          tips: [
            "Small optimizations compound into significant improvements over time",
            "Staff input is valuable for identifying efficiency opportunities",
            "Regular maintenance prevents performance degradation",
            "User experience improvements reduce training and support costs"
          ]
        }
      ]
    }
  ]

  const adminTips = [
    {
      icon: <Crown className="h-4 w-4 text-yellow-500" />,
      text: "Admin privileges come with responsibility - always verify critical changes before applying"
    },
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      text: "Regular staff communication prevents small issues from becoming major problems"
    },
    {
      icon: <BarChart3 className="h-4 w-4 text-green-500" />,
      text: "Use dashboard analytics to make data-driven decisions about scheduling and operations"
    },
    {
      icon: <Shield className="h-4 w-4 text-red-500" />,
      text: "Security best practices protect sensitive staff data and maintain system integrity"
    },
    {
      icon: <Database className="h-4 w-4 text-purple-500" />,
      text: "Regular data backups and system maintenance prevent costly downtime and data loss"
    },
    {
      icon: <Target className="h-4 w-4 text-orange-500" />,
      text: "Consistent admin routines and processes improve efficiency and reduce errors"
    }
  ]

  // Filter sections based on search
  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(item => 
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const handleSectionClick = (sectionId) => {
    setActiveSection(activeSection === sectionId ? '' : sectionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Crown className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Administrator User Manual
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive guide to mastering the SunCoop Admin Dashboard and advanced features
          </p>
          <Badge variant="secondary" className="px-4 py-2 text-base">
            👑 Administrator Version • v2.0
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search admin features, procedures, or help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-0"
            />
          </div>
        </div>

        {/* Demo Credentials */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
              <Crown className="h-5 w-5" />
              🎯 Demo Admin Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-blue-800">
                    👑 admin
                  </p>
                  <p className="text-sm text-blue-700">System Administrator</p>
                  <p className="text-xs text-blue-600">Full system access & control</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <p className="font-semibold text-blue-800">Admin Features</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Staff Management & Analytics</p>
                    <p>• Bulk Shift Generation</p>
                    <p>• System Reports & Settings</p>
                    <p>• Location & Time Management</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Admin Tip:</strong> The admin account provides full system control. Use responsibly and always backup data before major changes!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              ⭐ Essential Admin Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {adminTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {tip.icon}
                  <span className="text-sm text-gray-700 leading-relaxed">{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Sections */}
        <div className="space-y-4">
          {filteredSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="overflow-hidden">
              <CardHeader 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all"
                onClick={() => handleSectionClick(section.id)}
              >
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    {section.title}
                  </div>
                  {activeSection === section.id ? 
                    <ChevronUp className="h-5 w-5" /> : 
                    <ChevronDown className="h-5 w-5" />
                  }
                </CardTitle>
                <p className="text-blue-100 text-sm">{section.description}</p>
              </CardHeader>
              
              {activeSection === section.id && (
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {section.content.map((subsection, subsectionIndex) => (
                      <div key={subsectionIndex}>
                        <div className="flex items-center gap-3 mb-4">
                          {subsection.icon}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {subsection.subtitle}
                            </h3>
                            <p className="text-sm text-gray-600">{subsection.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              Step-by-Step Instructions
                            </h4>
                            <ol className="space-y-2">
                              {subsection.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded-full flex items-center justify-center mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-gray-700 leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          {subsection.tips && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Admin Pro Tips
                              </h4>
                              <div className="space-y-2">
                                {subsection.tips.map((tip, tipIndex) => (
                                  <div key={tipIndex} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-800">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {subsectionIndex < section.content.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Mail className="h-5 w-5" />
              📞 Admin Support & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-blue-700">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">🛠️ Technical Support</h4>
                <p className="text-sm">Contact system vendor or IT team for complex technical issues, integrations, or system-level problems.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">📚 Documentation</h4>
                <p className="text-sm">Access API documentation, integration guides, and advanced configuration resources in the admin panel.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">👥 Community</h4>
                <p className="text-sm">Connect with other administrators through user forums and knowledge sharing platforms.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p className="font-medium">SunCoop Staff Management System - Administrator Manual v2.0</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xs">This manual covers administrative features. Staff members have a separate user manual with role-appropriate content.</p>
        </div>
      </div>
    </div>
  )
}

export default UserManual