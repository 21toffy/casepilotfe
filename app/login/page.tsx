"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile"

// Interface for authentication error responses
interface AuthErrorResponse {
  description?: string
  details?: string
  message?: string
  error?: string
  verification_required?: boolean
  email?: string
  account_status?: 'unverified' | 'blocked'
}

// Interface for login result
interface LoginResult {
  success: boolean
  error?: string | AuthErrorResponse
  user?: any
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>("")

  // Get redirect URL from query params or sessionStorage
  const getRedirectUrl = () => {
    // First check URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const redirectParam = urlParams.get('redirect')
    if (redirectParam) {
      return decodeURIComponent(redirectParam)
    }
    
    // Then check sessionStorage
    const sessionRedirect = sessionStorage.getItem('redirectAfterLogin')
    if (sessionRedirect && sessionRedirect !== '/login') {
      return sessionRedirect
    }
    
    return '/dashboard'
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectUrl = getRedirectUrl()
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Only require Turnstile in production
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction && !turnstileToken) {
      setError("Please complete the security verification")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password, turnstileToken || undefined) as LoginResult
      
      if (result.success) {
        // Get redirect URL and navigate
        const redirectUrl = getRedirectUrl()
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectUrl)
      } else {
        // Check if this is a verification error
        if (result.error && typeof result.error === 'object') {
          const errorResponse = result.error as AuthErrorResponse
          // Check for account_status: "unverified" or verification_required flag
          if (errorResponse.account_status === 'unverified' || errorResponse.verification_required) {
            // Store email and tag for verification
            localStorage.setItem('verification_email', errorResponse.email || formData.email)
            localStorage.setItem('verification_tag', 'registration-verification')
            localStorage.setItem('auto_request_otp', 'true') // Auto-request OTP on verification page
            router.push('/verify-email')
          } else if (errorResponse.account_status === 'blocked') {
            setError("Account is disabled. Please contact support.")
          } else {
            setError(errorResponse.description || errorResponse.message || errorResponse.error || "Login failed")
          }
        } else {
          setError(result.error as string || "Login failed")
        }
      }
    } catch (error: any) {
      // Handle verification requirement from direct API response
      const errorResponse = error as AuthErrorResponse
      if (errorResponse.account_status === 'unverified' || errorResponse.verification_required || (error.message && error.message.includes('verification'))) {
        localStorage.setItem('verification_email', errorResponse.email || formData.email)
        localStorage.setItem('verification_tag', 'registration-verification')
        localStorage.setItem('auto_request_otp', 'true') // Auto-request OTP on verification page
        router.push('/verify-email')
      } else if (errorResponse.account_status === 'blocked') {
        setError("Account is disabled. Please contact support.")
      } else {
        setError(errorResponse.description || error.message || "An unexpected error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">LawCentrAI</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your LawCentrAI account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            {process.env.NODE_ENV === 'production' && (
              <div className="space-y-2">
                <CloudflareTurnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACDu5GHln9jdUVp0"}
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={(error) => {
                    console.error("Turnstile error:", error)
                    setError("Security verification failed. Please refresh the page.")
                  }}
                />
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting || (process.env.NODE_ENV === 'production' && !turnstileToken)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="flex justify-between text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
                <Link href="/register" className="text-blue-600 hover:underline">
                  Create account
                </Link>
              </div>
            </div>
          </form>
          <div className="mt-6">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
