import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { USER_ROLES } from '../lib/utils'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, BookOpen, AlertCircle, Info, User } from 'lucide-react'
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
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to SunCoop</h1>
          <p className="text-sm text-muted-foreground">Staff Management System</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your username or email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Alerts */}
            {error && (
              <Alert variant="destructive" className="mobile-alert">
                <div className="mobile-alert-content">
                  <AlertCircle className="mobile-alert-icon" />
                  <div className="mobile-alert-text">
                    <AlertDescription>{error}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            {setupError && (
              <Alert variant="destructive" className="mobile-alert">
                <div className="mobile-alert-content">
                  <AlertCircle className="mobile-alert-icon" />
                  <div className="mobile-alert-text">
                    <AlertDescription>{setupError}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            {/* Setup Check Loading */}
            {isCheckingSetup && (
              <Alert className="mobile-alert border-blue-200 bg-blue-50">
                <div className="mobile-alert-content">
                  <Info className="mobile-alert-icon text-blue-600" />
                  <div className="mobile-alert-text">
                    <AlertDescription className="text-blue-700">
                      Checking system status...
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="input-group">
                <Label htmlFor="identifier" className="form-label">Username or Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="min-h-[52px] text-base"
                  required
                />
              </div>
              
              <div className="input-group">
                <Label htmlFor="password" className="form-label">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[52px] text-base pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent tap-target"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link 
                  to="/password-reset" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors tap-target"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full min-h-[52px] text-base font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Manual Link */}
        <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
          <CardContent className="pt-6">
            <Link 
              to="/manual" 
              className="quick-action-card bg-blue-600 text-white hover:bg-blue-700 transition-colors block rounded-lg"
            >
              <div className="quick-action-content text-white">
                <div className="quick-action-icon-container bg-white/20">
                  <BookOpen className="quick-action-icon text-white" />
                </div>
                <div className="quick-action-text">
                  <div className="quick-action-title text-white">View Complete User Manual</div>
                </div>
              </div>
            </Link>
            <p className="text-center text-sm text-blue-700 mt-4">
              Learn about all features and capabilities before logging in
            </p>
          </CardContent>
        </Card>

        {/* Staff Registration Link */}
        <Card className="border-green-200 bg-green-50/50 shadow-sm">
          <CardContent className="pt-6">
            <Link 
              to="/staff-register" 
              className="quick-action-card bg-green-600 text-white hover:bg-green-700 transition-colors block rounded-lg"
            >
              <div className="quick-action-content text-white">
                <div className="quick-action-icon-container bg-white/20">
                  <User className="quick-action-icon text-white" />
                </div>
                <div className="quick-action-text">
                  <div className="quick-action-title text-white">Join as Staff Member</div>
                </div>
              </div>
            </Link>
            <p className="text-center text-sm text-green-700 mt-4">
              Request to join the team - admin approval required
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 