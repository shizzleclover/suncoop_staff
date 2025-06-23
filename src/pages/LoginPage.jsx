import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, BookOpen, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('') // Can be username or email
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, needsInitialSetup, validateSession, checkSystemStatus } = useAuthStore()
  const navigate = useNavigate()

      // Check if system needs initial setup
    useEffect(() => {
      const checkSetup = async () => {
        await checkSystemStatus()
        if (needsInitialSetup()) {
          navigate('/admin-setup')
          return
        }

        // Validate existing session
        if (validateSession()) {
          const user = useAuthStore.getState().user
          if (user?.role === USER_ROLES.ADMIN) {
            navigate('/admin/dashboard')
          } else {
            navigate('/staff/dashboard')
          }
        }
      }
      
      checkSetup()
    }, [needsInitialSetup, validateSession, navigate, checkSystemStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn(identifier, password)
      
      if (result.success) {
        const user = result.user
        toast.success(`Welcome back, ${user.firstName}!`)
        
        // Navigate based on role
        if (user.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard')
        } else {
          navigate('/staff/dashboard')
        }
      } else {
        setError(result.error || 'Invalid credentials')
        toast.error(result.error || 'Invalid credentials')
      }
    } catch (error) {
      const errorMessage = 'Something went wrong. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to SunCoop</h1>
          <p className="text-sm text-muted-foreground">Staff Management System</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your username or email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to="/password-reset" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Manual Link */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <Link 
              to="/manual" 
              className="flex items-center justify-center gap-3 w-full p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">View Complete User Manual</span>
            </Link>
            <p className="text-center text-sm text-blue-700 mt-3">
              Learn about all features and capabilities before logging in
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
      </div>
    </div>
  )
} 