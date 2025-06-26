import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  CreditCard,
  CheckCircle,
  Settings,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react'

const StaffUserManual = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: <User className="h-5 w-5" />,
      content: [
        {
          subtitle: "Logging In",
          steps: [
            "Enter your username/email and password",
            "Click 'Sign In' to access your dashboard",
            "If you forget your password, use 'Forgot Password?' link"
          ]
        },
        {
          subtitle: "Dashboard Overview",
          steps: [
            "View your upcoming shifts at a glance",
            "See today's schedule and location",
            "Check your recent time entries",
            "Access quick actions for common tasks"
          ]
        }
      ]
    },
    {
      title: "Managing Your Shifts",
      icon: <Calendar className="h-5 w-5" />,
      content: [
        {
          subtitle: "Viewing Available Shifts",
          steps: [
            "Go to 'Shifts' tab in the navigation",
            "Browse available shifts by date and location",
            "See shift details including time, duration, and location",
            "Filter shifts by location or date range"
          ]
        },
        {
          subtitle: "Booking Shifts",
          steps: [
            "Find an available shift you want to work",
            "Click 'Book Shift' button on the shift card",
            "Confirm your booking in the popup",
            "Shift will appear in 'My Shifts' section"
          ]
        },
        {
          subtitle: "Managing Your Shifts",
          steps: [
            "View all your booked shifts in 'My Shifts'",
            "Cancel shifts if needed (follow company policy)",
            "See shift status: Scheduled, In Progress, Completed",
            "Get location details and directions"
          ]
        }
      ]
    },
    {
      title: "Time Tracking",
      icon: <Clock className="h-5 w-5" />,
      content: [
        {
          subtitle: "Clocking In/Out",
          steps: [
            "Use the Time Tracking tab to record your work hours",
            "Click 'Clock In' when you start your shift",
            "Select the correct location for your shift",
            "Click 'Clock Out' when your shift ends",
            "Add notes about your shift if required"
          ]
        },
        {
          subtitle: "Viewing Time Entries",
          steps: [
            "Access 'Time Tracking' to see your recorded hours",
            "View daily, weekly, and monthly summaries",
            "See total hours worked per pay period",
            "Review individual shift details and notes"
          ]
        }
      ]
    },
    {
      title: "Profile Management",
      icon: <Settings className="h-5 w-5" />,
      content: [
        {
          subtitle: "Updating Your Profile",
          steps: [
            "Go to 'Profile' tab in the navigation",
            "Update your personal information",
            "Change your contact details",
            "Update your password for security"
          ]
        },
        {
          subtitle: "Account Settings",
          steps: [
            "Manage notification preferences",
            "Set your availability preferences",
            "Update emergency contact information",
            "Review your employment details"
          ]
        }
      ]
    },
    {
      title: "Mobile Features",
      icon: <MapPin className="h-5 w-5" />,
      content: [
        {
          subtitle: "Using the PWA",
          steps: [
            "Install the app on your phone for easy access",
            "Use location services for accurate clock in/out",
            "Receive push notifications for shift reminders",
            "Access all features offline when needed"
          ]
        }
      ]
    },
    {
      title: "Help & Support",
      icon: <Phone className="h-5 w-5" />,
      content: [
        {
          subtitle: "Getting Help",
          steps: [
            "Contact your supervisor for shift-related questions",
            "Use the help section for technical issues",
            "Check company policies for procedural questions",
            "Report any app issues to IT support"
          ]
        },
        {
          subtitle: "Common Issues",
          steps: [
            "Can't clock in? Check your location services",
            "Missing shifts? Refresh the page or app",
            "Login issues? Verify your credentials",
            "App not working? Try refreshing or reinstalling"
          ]
        }
      ]
    }
  ]

  const tips = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "Always clock in at the correct location for accurate tracking"
    },
    {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: "Book shifts early as popular times fill up quickly"
    },
    {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      text: "Check your schedule regularly for updates or changes"
    },
    {
      icon: <MapPin className="h-4 w-4 text-purple-500" />,
      text: "Enable location services for the best experience"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Staff User Manual
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your complete guide to using the SunCoop Staff Management System
          </p>
          <Badge variant="secondary" className="px-4 py-2">
            Staff Version
          </Badge>
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quick Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {tip.icon}
                  <span className="text-sm text-gray-700">{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Sections */}
        <div className="grid gap-6">
          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="text-xl flex items-center gap-3">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {section.content.map((subsection, subsectionIndex) => (
                    <div key={subsectionIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {subsection.subtitle}
                      </h3>
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
                      {subsectionIndex < section.content.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Mail className="h-5 w-5" />
              Need Additional Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-green-700">
              <p>
                <strong>Technical Support:</strong> Contact your system administrator
              </p>
              <p>
                <strong>Shift Questions:</strong> Speak with your direct supervisor
              </p>
              <p>
                <strong>Emergency:</strong> Call the emergency contact number provided by HR
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>SunCoop Staff Management System - Staff User Manual v1.0</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default StaffUserManual 