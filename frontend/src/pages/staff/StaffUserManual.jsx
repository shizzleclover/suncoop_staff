import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Separator } from '../../components/ui/separator'
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle,
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
  BookOpen,
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
  Download
} from 'lucide-react'

const StaffUserManual = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('')

  const sections = [
    {
      id: 'getting-started',
      title: "🚀 Getting Started",
      icon: <User className="h-5 w-5" />,
      description: "Everything you need to know to start using the system",
      content: [
        {
          subtitle: "First Time Login",
          icon: <LogIn className="h-4 w-4 text-green-600" />,
          description: "How to access your staff account for the first time",
          steps: [
            "Open your web browser and navigate to the SunCoop application URL",
            "Enter the username and password provided by your administrator",
            "Click 'Sign In' to access your personalized staff dashboard",
            "If you have trouble logging in, use the 'Forgot Password?' link",
            "For security, change your password after first login in Profile settings",
            "Enable 'Remember Me' on trusted devices for faster access"
          ],
          tips: [
            "The system works on any device - smartphone, tablet, or computer",
            "Add the app to your home screen for instant access",
            "Keep your login credentials secure and don't share them",
            "Contact your supervisor if you experience login issues"
          ]
        },
        {
          subtitle: "Understanding Your Dashboard",
          icon: <Home className="h-4 w-4 text-blue-600" />,
          description: "Navigate your personalized staff dashboard like a pro",
          steps: [
            "Your dashboard shows the most important information at a glance",
            "View today's shifts, upcoming schedule, and recent activities",
            "Use quick action buttons for common tasks like clocking in/out",
            "Check notifications in the top-right corner for important updates",
            "Access different sections using the sidebar navigation menu",
            "Dashboard updates automatically - no need to refresh manually"
          ],
          tips: [
            "Bookmark your dashboard for quick daily access",
            "The dashboard is mobile-optimized for easy phone use",
            "Click on any card to view more detailed information",
            "Your dashboard shows real-time information"
          ]
        },
        {
          subtitle: "Mobile App Installation",
          icon: <Smartphone className="h-4 w-4 text-purple-600" />,
          description: "Install the PWA for the best mobile experience",
          steps: [
            "On your smartphone, open the SunCoop website in your browser",
            "Look for the 'Add to Home Screen' prompt at the bottom",
            "Tap 'Add' to install the app on your device",
            "The app icon will appear on your home screen like any other app",
            "Open the app for faster access and offline capabilities",
            "Enable location services for accurate time tracking"
          ],
          tips: [
            "The PWA works offline for viewing your schedule",
            "Push notifications keep you updated on shift changes",
            "The app uses less data than the website",
            "Works on both iOS and Android devices"
          ]
        }
      ]
    },
    {
      id: 'shift-management',
      title: "📅 Managing Your Shifts",
      icon: <Calendar className="h-5 w-5" />,
      description: "Master shift booking, scheduling, and management",
      content: [
        {
          subtitle: "Finding Available Shifts",
          icon: <Search className="h-4 w-4 text-green-600" />,
          description: "Discover and filter shifts that match your schedule",
          steps: [
            "Navigate to 'Shifts' in the sidebar menu",
            "Click on 'Available Shifts' tab to see open positions",
            "Use the location filter to find shifts near you",
            "Filter by date range to plan your week or month",
            "View shift details including time, duration, pay rate, and requirements",
            "Check the location details and directions before booking"
          ],
          tips: [
            "Popular shifts fill up quickly - check regularly",
            "Set up notifications for new shifts in preferred locations",
            "Read all requirements carefully before booking",
            "Consider travel time when selecting shifts"
          ]
        },
        {
          subtitle: "Booking Shifts",
          icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
          description: "Step-by-step guide to securing your work shifts",
          steps: [
            "Find a shift that matches your availability and preferences",
            "Click the 'Book Shift' button on the shift card",
            "Review all shift details in the confirmation dialog",
            "Confirm your booking - the shift will immediately appear in 'My Shifts'",
            "Receive a confirmation notification with shift details",
            "Add the shift to your personal calendar if desired"
          ],
          tips: [
            "Book shifts as early as possible for the best selection",
            "Double-check the date and time before confirming",
            "Make sure you can commit to the entire shift duration",
            "Contact your supervisor immediately if you book by mistake"
          ]
        },
        {
          subtitle: "Managing Your Booked Shifts",
          icon: <Timer className="h-4 w-4 text-orange-600" />,
          description: "View, modify, and track your scheduled work",
          steps: [
            "Go to 'My Shifts' tab to see all your booked shifts",
            "View shift status: Scheduled, In Progress, or Completed",
            "See countdown timers for upcoming shifts",
            "Get location details, directions, and contact information",
            "Cancel shifts if needed (follow company cancellation policy)",
            "View shift history and completed work"
          ],
          tips: [
            "Cancel shifts at least 24 hours in advance when possible",
            "Set phone reminders for upcoming shifts",
            "Review location details before traveling to new sites",
            "Keep emergency contact numbers handy"
          ]
        },
        {
          subtitle: "Shift Notifications & Reminders",
          icon: <Bell className="h-4 w-4 text-purple-600" />,
          description: "Stay informed about your shifts and changes",
          steps: [
            "Enable browser notifications for real-time updates",
            "Receive reminders 24 hours and 1 hour before shifts",
            "Get notified about shift changes or cancellations",
            "See alerts for new shifts in your preferred locations",
            "Configure notification preferences in your profile",
            "Check the notification center for important announcements"
          ],
          tips: [
            "Allow notifications for the best experience",
            "Check notifications regularly for important updates",
            "Notification preferences can be customized",
            "Emergency notifications override quiet hours"
          ]
        }
      ]
    },
    {
      id: 'time-tracking',
      title: "⏰ Time Tracking",
      icon: <Clock className="h-5 w-5" />,
      description: "Accurate time tracking for precise payroll and records",
      content: [
        {
          subtitle: "Clocking In & Out",
          icon: <Timer className="h-4 w-4 text-green-600" />,
          description: "Master the clock-in/out process for accurate time recording",
          steps: [
            "Navigate to 'Time Tracking' section from the main menu",
            "Arrive at your shift location before the scheduled start time",
            "Click 'Clock In' when you're ready to begin work",
            "Verify your location is detected correctly",
            "Select the correct shift if you have multiple scheduled",
            "Add any relevant notes about your shift or tasks",
            "Click 'Clock Out' when your shift is complete"
          ],
          tips: [
            "Always clock in from the correct work location",
            "Clock in within 15 minutes of your scheduled start time",
            "Add detailed notes for shifts with special tasks",
            "Take a screenshot if you experience technical issues"
          ]
        },
        {
          subtitle: "Location-Based Tracking",
          icon: <MapPin className="h-4 w-4 text-blue-600" />,
          description: "Understanding GPS and location verification",
          steps: [
            "Enable location services on your device for accurate tracking",
            "The system automatically detects when you're at a work location",
            "Green indicators show you're in the correct location",
            "Red indicators mean you're outside the approved work area",
            "Contact your supervisor if location detection isn't working",
            "Manual location entry may be available for special circumstances"
          ],
          tips: [
            "Turn on high-accuracy location for best results",
            "Indoor locations may have GPS signal challenges",
            "Connect to facility WiFi for improved location accuracy",
            "Report persistent location issues to IT support"
          ]
        },
        {
          subtitle: "Viewing Your Time Records",
          icon: <Calendar className="h-4 w-4 text-purple-600" />,
          description: "Track your hours and monitor your work history",
          steps: [
            "Access 'Time Tracking' to see all your recorded hours",
            "View daily, weekly, and monthly time summaries",
            "Check total hours worked for the current pay period",
            "Review individual time entries with start/end times",
            "See the status of each entry: Pending, Approved, or Rejected",
            "Export your timesheet data if needed"
          ],
          tips: [
            "Review your time entries weekly for accuracy",
            "Report any discrepancies immediately",
            "Keep personal records for your own reference",
            "Understand your company's pay period schedule"
          ]
        },
        {
          subtitle: "Editing & Corrections",
          icon: <Settings className="h-4 w-4 text-orange-600" />,
          description: "How to handle time entry corrections and modifications",
          steps: [
            "Contact your supervisor for time entry corrections",
            "Provide specific details about the correction needed",
            "Include the date, time, and reason for the change",
            "Some minor edits may be available in your profile",
            "All changes are logged for audit purposes",
            "Corrections must be approved by management"
          ],
          tips: [
            "Make correction requests as soon as possible",
            "Be specific and honest about needed changes",
            "Keep documentation for unusual circumstances",
            "Follow company policy for time corrections"
          ]
        }
      ]
    },
    {
      id: 'profile-settings',
      title: "👤 Profile & Settings",
      icon: <User className="h-5 w-5" />,
      description: "Manage your personal information and preferences",
      content: [
        {
          subtitle: "Personal Information",
          icon: <UserCheck className="h-4 w-4 text-green-600" />,
          description: "Keep your contact details and information current",
          steps: [
            "Click your profile picture or name in the top header",
            "Select 'Profile' from the dropdown menu",
            "Update your contact information (phone, email, address)",
            "Change your emergency contact details",
            "Upload a professional profile picture",
            "Review and update your availability preferences",
            "Save all changes before leaving the page"
          ],
          tips: [
            "Keep emergency contacts current for safety",
            "Use a professional email address",
            "Profile pictures help supervisors and colleagues",
            "Update availability when your schedule changes"
          ]
        },
        {
          subtitle: "Password & Security",
          icon: <Shield className="h-4 w-4 text-red-600" />,
          description: "Maintain account security and access control",
          steps: [
            "Go to Profile > Security section",
            "Click 'Change Password' to update your password",
            "Enter your current password for verification",
            "Create a strong new password with mixed characters",
            "Confirm the new password by typing it again",
            "Save changes and use the new password for future logins",
            "Consider enabling two-factor authentication if available"
          ],
          tips: [
            "Use a unique password just for this system",
            "Include uppercase, lowercase, numbers, and symbols",
            "Don't share your password with anyone",
            "Change your password regularly for security"
          ]
        },
        {
          subtitle: "Notification Preferences",
          icon: <Bell className="h-4 w-4 text-blue-600" />,
          description: "Customize how and when you receive notifications",
          steps: [
            "Access notification settings in your profile",
            "Choose which types of notifications you want to receive",
            "Set preferences for shift reminders and updates",
            "Configure email vs. push notification delivery",
            "Set quiet hours to avoid notifications during sleep",
            "Test notification settings to ensure they work",
            "Save your preferences"
          ],
          tips: [
            "Enable shift reminders to never miss work",
            "Turn on emergency notifications for safety",
            "Customize notification timing to your schedule",
            "Test notifications after making changes"
          ]
        }
      ]
    },
    {
      id: 'mobile-features',
      title: "📱 Mobile Features",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Make the most of the mobile app experience",
      content: [
        {
          subtitle: "Progressive Web App (PWA)",
          icon: <Download className="h-4 w-4 text-green-600" />,
          description: "Install and use the mobile app effectively",
          steps: [
            "Open the SunCoop website in your mobile browser",
            "Look for 'Add to Home Screen' or 'Install App' prompt",
            "Follow the installation prompts for your device",
            "Find the SunCoop icon on your home screen",
            "Open the app for faster access and offline features",
            "Enable location services when prompted for accurate tracking"
          ],
          tips: [
            "The PWA works like a native app but through your browser",
            "Updates happen automatically - no app store required",
            "Works offline for viewing schedules and basic functions",
            "Uses less storage than traditional apps"
          ]
        },
        {
          subtitle: "Offline Capabilities",
          icon: <Wifi className="h-4 w-4 text-blue-600" />,
          description: "Access important features without internet",
          steps: [
            "View your saved shift schedule even without internet",
            "Access contact information and location details offline",
            "Clock in/out entries are saved and sync when connection returns",
            "View your recent time tracking history offline",
            "Emergency contact information remains accessible",
            "Sync occurs automatically when internet is restored"
          ],
          tips: [
            "Load the app while connected to cache important data",
            "Offline features are limited but include essentials",
            "Time entries made offline will sync when connected",
            "Check for updates when connection is restored"
          ]
        },
        {
          subtitle: "GPS & Location Features",
          icon: <Navigation className="h-4 w-4 text-purple-600" />,
          description: "Optimize location services for accurate tracking",
          steps: [
            "Enable 'High Accuracy' location services for best results",
            "Allow the app to access your location when prompted",
            "Turn on location services for the SunCoop app in device settings",
            "Use GPS navigation to find work locations",
            "Report location issues if GPS detection isn't working",
            "Consider battery impact of continuous location tracking"
          ],
          tips: [
            "High accuracy mode provides the most precise tracking",
            "Indoor locations may have weaker GPS signals",
            "Connect to facility WiFi for improved accuracy",
            "Location data is used only for work verification"
          ]
        },
        {
          subtitle: "Push Notifications",
          icon: <Bell className="h-4 w-4 text-orange-600" />,
          description: "Stay informed with real-time mobile alerts",
          steps: [
            "Allow push notifications when installing the app",
            "Configure notification preferences in your profile",
            "Receive shift reminders, updates, and announcements",
            "Get notified about new available shifts",
            "See alerts for schedule changes or cancellations",
            "Manage notification sound and vibration settings"
          ],
          tips: [
            "Notifications help you stay on top of your schedule",
            "Critical alerts may override quiet hours",
            "Customize notification types in your profile",
            "Turn off notifications you don't need"
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: "🔧 Troubleshooting",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Solutions to common issues and problems",
      content: [
        {
          subtitle: "Login Problems",
          icon: <LogIn className="h-4 w-4 text-red-600" />,
          description: "Can't access your account? Try these solutions",
          steps: [
            "Double-check your username and password for typos",
            "Try using your email address instead of username",
            "Use the 'Forgot Password?' link to reset your password",
            "Clear your browser cache and cookies",
            "Try logging in from a different browser or device",
            "Contact your supervisor if the issue persists"
          ],
          tips: [
            "Password resets may take a few minutes to arrive",
            "Check your spam folder for password reset emails",
            "Make sure Caps Lock is not enabled",
            "Copy and paste credentials if typing isn't working"
          ]
        },
        {
          subtitle: "Clock In/Out Issues",
          icon: <Clock className="h-4 w-4 text-orange-600" />,
          description: "Resolve time tracking problems quickly",
          steps: [
            "Ensure you're at the correct work location",
            "Check that location services are enabled",
            "Try refreshing the page and attempting again",
            "Take a screenshot of any error messages",
            "Contact your supervisor immediately if unable to clock in",
            "Document your actual work times for manual entry"
          ],
          tips: [
            "Location issues are the most common clock-in problem",
            "Indoor locations may have weaker GPS signals",
            "Manual time entry may be available as backup",
            "Report technical issues promptly to avoid pay problems"
          ]
        },
        {
          subtitle: "App Performance Issues",
          icon: <Battery className="h-4 w-4 text-blue-600" />,
          description: "Fix slow or unresponsive app behavior",
          steps: [
            "Close and reopen the app completely",
            "Check your internet connection strength",
            "Clear the app cache in your browser settings",
            "Update your browser to the latest version",
            "Restart your device if problems persist",
            "Try using the web version if the PWA isn't working"
          ],
          tips: [
            "Slow performance often indicates connectivity issues",
            "Older devices may experience slower performance",
            "The web version can be used as a backup",
            "Regular browser updates improve performance"
          ]
        },
        {
          subtitle: "Notification Problems",
          icon: <Bell className="h-4 w-4 text-purple-600" />,
          description: "Not receiving important alerts? Here's how to fix it",
          steps: [
            "Check notification permissions in device settings",
            "Verify notification preferences in your profile",
            "Ensure the app has permission to send notifications",
            "Check if Do Not Disturb mode is enabled",
            "Test notifications by updating your profile",
            "Contact IT support if notifications still don't work"
          ],
          tips: [
            "Notification permissions are set at the device level",
            "Some devices have aggressive battery optimization",
            "Add the app to battery optimization whitelist",
            "Test notifications after making changes"
          ]
        }
      ]
    },
    {
      id: 'help-support',
      title: "🆘 Help & Support",
      icon: <Phone className="h-5 w-5" />,
      description: "Get help when you need it most",
      content: [
        {
          subtitle: "Who to Contact",
          icon: <Phone className="h-4 w-4 text-green-600" />,
          description: "Know who to reach out to for different types of issues",
          steps: [
            "Shift-related questions: Contact your direct supervisor",
            "Technical problems: Reach out to IT support or system admin",
            "Pay or timesheet issues: Speak with HR or payroll department",
            "Emergency situations: Use emergency contact numbers",
            "Account access problems: Contact your supervisor or IT",
            "App bugs or feature requests: Report to system administrator"
          ],
          tips: [
            "Save important contact numbers in your phone",
            "Include specific details when reporting issues",
            "Take screenshots of error messages when possible",
            "Keep a record of your communication for follow-up"
          ]
        },
        {
          subtitle: "Emergency Procedures",
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          description: "Important steps for emergency situations",
          steps: [
            "For medical emergencies: Call 911 immediately",
            "Report workplace incidents to your supervisor right away",
            "Use emergency contact numbers provided in your profile",
            "Document any incidents or safety concerns",
            "Follow your company's emergency response procedures",
            "Know the evacuation routes at each work location"
          ],
          tips: [
            "Safety is always the top priority",
            "Don't hesitate to call for help in emergencies",
            "Report near-misses to prevent future incidents",
            "Keep emergency contacts easily accessible"
          ]
        },
        {
          subtitle: "Frequently Asked Questions",
          icon: <HelpCircle className="h-4 w-4 text-blue-600" />,
          description: "Quick answers to common questions",
          steps: [
            "Q: Can I trade shifts with other staff? A: Check company policy - some allow approved trades",
            "Q: What if I'm running late? A: Contact your supervisor immediately",
            "Q: Can I work overtime? A: Follow company overtime policies and get approval",
            "Q: How do I request time off? A: Submit requests through your supervisor",
            "Q: What if the app isn't working? A: Document your time and report the issue",
            "Q: How often am I paid? A: Check your employment agreement for pay schedules"
          ],
          tips: [
            "Company policies may vary - check your employee handbook",
            "When in doubt, ask your supervisor for clarification",
            "Keep personal records as backup to system data",
            "Understand your company's specific procedures"
          ]
        }
      ]
    }
  ]

  const tips = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "Always clock in at the correct location for accurate tracking and compliance"
    },
    {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: "Book shifts early as popular times and locations fill up quickly"
    },
    {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      text: "Check your schedule regularly for updates, changes, or new opportunities"
    },
    {
      icon: <MapPin className="h-4 w-4 text-purple-500" />,
      text: "Enable location services for seamless clock-in/out and accurate tracking"
    },
    {
      icon: <Smartphone className="h-4 w-4 text-indigo-500" />,
      text: "Install the mobile app for faster access and offline schedule viewing"
    },
    {
      icon: <Bell className="h-4 w-4 text-orange-500" />,
      text: "Enable notifications to never miss shift reminders or important updates"
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
            <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Staff User Manual
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your complete guide to mastering the SunCoop Staff Management System
          </p>
          <Badge variant="secondary" className="px-4 py-2 text-base">
            👥 Staff Version • v2.0
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for features, guides, or help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl border-2 focus:border-green-500 focus:ring-0"
            />
          </div>
        </div>

        {/* Demo Credentials */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-green-800">
              <UserCheck className="h-5 w-5" />
              🎯 Demo Staff Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { username: 'sarah.chen', role: 'Senior Staff • Team Lead', experience: '3+ years experience' },
                { username: 'mike.johnson', role: 'Operations Staff • Multi-location', experience: '2 years experience' },
                { username: 'emma.wilson', role: 'Part-time Staff • Student', experience: 'New team member' },
                { username: 'alex.thompson', role: 'Full-time Staff • Supervisor Track', experience: '1 year experience' }
              ].map((staff, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-800">
                      👤 {staff.username}
                    </p>
                    <p className="text-sm text-green-700">{staff.role}</p>
                    <p className="text-xs text-green-600">{staff.experience}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>💡 Tip:</strong> Try different demo accounts to see how the system adapts to different staff roles and experience levels!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              ⭐ Essential Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tips.map((tip, index) => (
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
                                Pro Tips
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
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Mail className="h-5 w-5" />
              📞 Need Additional Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-green-700">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">🔧 Technical Support</h4>
                <p className="text-sm">Contact your system administrator for app issues, login problems, or technical difficulties.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">📅 Shift Questions</h4>
                <p className="text-sm">Speak with your direct supervisor for scheduling, shift changes, or work-related inquiries.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">🚨 Emergency</h4>
                <p className="text-sm">Call the emergency contact number provided by HR for urgent situations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p className="font-medium">SunCoop Staff Management System - Staff User Manual v2.0</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xs">This manual is designed specifically for staff members. Administrators have access to additional features.</p>
        </div>
      </div>
    </div>
  )
}

export default StaffUserManual 