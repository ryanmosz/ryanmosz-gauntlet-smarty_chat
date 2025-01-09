'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { login } from '@/lib/api'
import type { AuthResponse } from '@/types/api'

// Test user credentials
const TEST_USER = {
  email: 'jd@example.com',
  password: 'password1!'
}

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [eyeClickCount, setEyeClickCount] = useState(0)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1)
      }, 1000)
    } else if (lockoutTimer === 0) {
      setIsLocked(false)
    }
    return () => clearInterval(interval)
  }, [isLocked, lockoutTimer])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked || isLoading) return

    setIsLoading(true)

    try {
      // Use test credentials if both fields are empty
      const useTestCredentials = !email.trim() && !password.trim()
      const loginEmail = useTestCredentials ? TEST_USER.email : email
      const loginPassword = useTestCredentials ? TEST_USER.password : password

      const user = await login({ email: loginEmail, password: loginPassword })
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      })
      
      router.push('/chat')
    } catch (error) {
      setLoginAttempts((prev) => prev + 1)
      
      if (loginAttempts === 1) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. One more attempt before lockout.",
          variant: "destructive",
        })
      } else if (loginAttempts === 2) {
        setIsLocked(true)
        setLockoutTimer(10)
        toast({
          title: "Account locked",
          description: "Too many failed attempts. Please try again in 10 seconds.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setEyeClickCount((prevCount) => prevCount + 1)
    if (eyeClickCount === 1) {
      setShowPassword(false)
      setEyeClickCount(0)
    } else {
      setShowPassword(true)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-inter font-semibold text-gray-700 mb-2">Welcome to</h2>
        <h1 className="text-6xl font-permanent-marker text-blue-600">Smarty Chat</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            Enter your credentials to access Smarty Chat
            <br />
            <span className="text-sm text-gray-500">(Leave both fields empty to use test account)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked || isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked || isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={isLocked || isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full" 
            onClick={handleLogin} 
            disabled={isLocked || isLoading}
          >
            {isLocked ? `Locked (${lockoutTimer}s)` : isLoading ? 'Logging in...' : 'Log In'}
          </Button>
          <div className="text-sm text-center">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
      {loginAttempts === 2 && !isLocked && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You have one more attempt before your account is temporarily locked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

