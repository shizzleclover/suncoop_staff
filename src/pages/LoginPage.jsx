import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, BookOpen, User, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('') // Can be username or email
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, needsInitialSetup, validateSession, checkSystemStatus, user } = useAuthStore()
  const navigate = useNavigate()
  const [isCheckingSetup, setIsCheckingSetup] = useState(false)
  const [setupError, setSetupError] = useState('')

  const checkSetup = async () => {
    try {
      setIsCheckingSetup(true);
      setSetupError('');
      
      // Check system status (now with caching and deduplication)
      const systemStatus = await checkSystemStatus();
      
      if (systemStatus.needsInitialSetup) {
        navigate('/admin/setup');
      }
    } catch (error) {
      console.error('Setup check failed:', error);
      setSetupError(error.message || 'Failed to connect to server. Please try again.');
    } finally {
      setIsCheckingSetup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both username/email and password');
      return;
    }

    if (isLoading) return; // Prevent multiple submissions

    setError('');
    setIsLoading(true);

    try {
      await signIn(identifier, password);
      toast.success('Login successful!');
      
      // Small delay to show success message
      setTimeout(() => {
        if (user?.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard');
        } else {
          navigate('/staff/dashboard');
        }
      }, 500);
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle specific error types
      if (error.message.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else if (error.message.includes('Invalid credentials')) {
        setError('Invalid username/email or password. Please try again.');
      } else if (error.message.includes('backend server')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if system needs initial setup
  useEffect(() => {
    checkSetup();
  }, []);

  // Validate existing session
  useEffect(() => {
    if (validateSession()) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    }
  }, [validateSession, navigate]);

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
            {/* Error Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {setupError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{setupError}</AlertDescription>
              </Alert>
            )}
            
            {/* Setup Check Loading */}
            {isCheckingSetup && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Checking system status...
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-transparent"
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
                className="w-full h-11" 
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