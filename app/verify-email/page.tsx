"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [tag, setTag] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [canResend, setCanResend] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email and tag from localStorage
    const storedEmail = localStorage.getItem('verification_email')
    const storedTag = localStorage.getItem('verification_tag')
    
    console.log('[VerifyEmail] Stored email:', storedEmail)
    console.log('[VerifyEmail] Stored tag:', storedTag)
    
    if (!storedEmail || !storedTag) {
      console.log('[VerifyEmail] Missing email or tag, redirecting to register')
      setError('Verification session expired. Please register again.')
      // Add a delay before redirecting to allow user to see the error
      setTimeout(() => {
        router.push('/register')
      }, 2000)
      return
    }
    
    setEmail(storedEmail)
    setTag(storedTag)
    
    // Auto-request OTP if coming from login redirect
    const shouldAutoRequest = localStorage.getItem('auto_request_otp')
    if (shouldAutoRequest === 'true') {
      localStorage.removeItem('auto_request_otp')
      // Request OTP automatically
      requestOtp(storedEmail, storedTag, true)
    }
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join("")
    
    if (otpToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    // Only require Turnstile in production
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction && !turnstileToken) {
      setError("Please complete the security verification")
      return
    }

    setError("")
    setIsVerifying(true)

    try {
      const apiClient = getApiClient()
      const response = await apiClient.post('/api/verification/otp/verify/', {
        email,
        otp: otpToVerify,
        tag,
        turnstile_token: turnstileToken || undefined
      })

      if (response.error) {
        setError(response.error)
        return
      }

      // Success
      toast({
        variant: "success",
        title: "Email Verified!",
        description: "Your account has been verified successfully.",
      })

      // Get pending tokens and store them properly
      const pendingTokens = localStorage.getItem('pending_tokens')
      if (pendingTokens) {
        const tokenData = JSON.parse(pendingTokens)
        localStorage.setItem(
          process.env.NEXT_PUBLIC_SESSION_STORAGE_KEY || 'lawcentrai_session',
          JSON.stringify(tokenData)
        )
        localStorage.removeItem('pending_tokens')
      }

      // Clean up verification data
      localStorage.removeItem('verification_email')
      localStorage.removeItem('verification_tag')

      // Redirect to login or dashboard
      if (tag === 'registration-verification') {
        router.push('/login?verified=true')
      } else {
        router.push('/login')
      }

    } catch (error: any) {
      setError(error.message || "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const requestOtp = async (emailAddr: string, tagValue: string, isAutoRequest = false) => {
    if (!isAutoRequest) {
      setError("")
      setIsResending(true)
    }

    try {
      const apiClient = getApiClient()
      const response = await apiClient.post('/api/verification/otp/request/', {
        email: emailAddr,
        tag: tagValue,
        resend: !isAutoRequest
      })

      if (response.error) {
        if (!isAutoRequest) setError(response.error)
        return
      }

      if (!isAutoRequest) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        })
      } else {
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code.",
        })
      }

      // Reset timer
      setTimeLeft(180)
      setCanResend(false)

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      if (!isAutoRequest) setError(error.message || "Failed to send verification code")
    } finally {
      if (!isAutoRequest) setIsResending(false)
    }
  }

  const handleResendOtp = async () => {
    await requestOtp(email, tag, false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTitle = () => {
    switch (tag) {
      case 'registration-verification':
        return 'Verify Your Email'
      case 'password-reset':
        return 'Reset Password Verification'
      case 'login-verification':
        return 'Login Verification'
      default:
        return 'Email Verification'
    }
  }

  const getDescription = () => {
    switch (tag) {
      case 'registration-verification':
        return 'We sent a 6-digit verification code to your email address. Enter it below to activate your account.'
      case 'password-reset':
        return 'We sent a 6-digit code to your email. Enter it below to reset your password.'
      case 'login-verification':
        return 'We sent a 6-digit code to your email for security verification.'
      default:
        return 'We sent a 6-digit verification code to your email address.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-center">
            {getDescription()}
          </CardDescription>
          {email && (
            <p className="text-sm text-gray-600 text-center mt-2">
              Code sent to: <span className="font-medium">{email}</span>
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label htmlFor="otp" className="text-center block">
              Enter 6-digit verification code
            </Label>
            
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={isVerifying}
                />
              ))}
            </div>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in {formatTime(timeLeft)}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Code has expired
                </p>
              )}
            </div>
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

          <Button
            onClick={() => handleVerify()}
            disabled={isVerifying || otp.some(digit => !digit) || (process.env.NODE_ENV === 'production' && !turnstileToken)}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendOtp}
              disabled={!canResend || isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Registration
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}