import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { useAuthStore } from './store'
import { USER_ROLES } from './lib/utils'

// Components
import LoginPage from './pages/LoginPage'
import AdminSetup from './pages/AdminSetup'
import PasswordReset from './pages/PasswordReset'
import StaffRegister from './pages/StaffRegister'
import UserManual from './pages/UserManual'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffShifts from './pages/staff/StaffShifts'
import StaffTimeTracking from './pages/staff/StaffTimeTracking'
import StaffProfile from './pages/staff/StaffProfile'
import StaffUserManual from './pages/staff/StaffUserManual'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStaff from './pages/admin/AdminStaff'
import AdminShifts from './pages/admin/AdminShifts'
import AdminLocations from './pages/admin/AdminLocations'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminProfile from './pages/admin/AdminProfile'
import AdminWiFiTracking from './pages/admin/AdminWiFiTracking'
import Layout from './components/Layout'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === USER_ROLES.STAFF) {
      return <Navigate to="/staff/dashboard" replace />
    } else if (user.role === USER_ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    }
  }
  
  return <Layout>{children}</Layout>
}

// Public route wrapper (only accessible when not authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (isAuthenticated && user) {
    // Redirect based on user role
    if (user.role === USER_ROLES.STAFF) {
      return <Navigate to="/staff/dashboard" replace />
    } else if (user.role === USER_ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    }
  }
  
  return children
}

function App() {
  const { initializeAuth } = useAuthStore()

  // Initialize auth on app load
  React.useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/admin-setup" 
            element={<AdminSetup />} 
          />
          <Route 
            path="/staff-register" 
            element={
              <PublicRoute>
                <StaffRegister />
              </PublicRoute>
            } 
          />
          <Route 
            path="/password-reset" 
            element={<PasswordReset />} 
          />
          <Route 
            path="/manual" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF, USER_ROLES.ADMIN]}>
                <UserManual />
              </ProtectedRoute>
            } 
          />
          
          {/* Staff Routes */}
          <Route 
            path="/staff/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/shifts" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
                <StaffShifts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/time-tracking" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
                <StaffTimeTracking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/profile" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
                <StaffProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/user-manual" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
                <StaffUserManual />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/staff" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminStaff />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/shifts" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminShifts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/locations" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminLocations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/profile" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/wifi-tracking" 
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminWiFiTracking />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy redirects */}
          <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        <ShadcnToaster />
      </div>
    </Router>
  )
}

export default App
