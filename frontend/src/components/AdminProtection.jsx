import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'
import { AlertCircle, Shield } from 'lucide-react'

/**
 * AdminProtection component that wraps admin-only pages
 * Shows access denied message if user is not an administrator
 */
export default function AdminProtection({ children }) {
  const { user: currentUser } = useAuthStore()
  
  // Check if current user is admin
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN

  // Show unauthorized access message if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only administrators can access this page. Please contact your system administrator if you need access.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Shield className="w-4 h-4" />
            <span>Administrator privileges required</span>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // User is admin, render the protected content
  return children
} 