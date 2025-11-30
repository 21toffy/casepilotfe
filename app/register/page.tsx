"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { RegistrationService } from "@/lib/registration-service"
import { useToast } from "@/lib/use-toast"
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile"

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firmName: "",
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    firmAddress: "",
    phone: "",
    jurisdiction: "",
    practiceAreas: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>("")

  // Redirect if already authenticated (but not if we're in the middle of redirecting to verification)
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isRedirecting) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router, isRedirecting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }

      // Only require Turnstile in production
      const isProduction = process.env.NODE_ENV === 'production'
      if (isProduction && !turnstileToken) {
        setError("Please complete the security verification")
        setIsSubmitting(false)
        return
      }

      // Register firm
      const result = await RegistrationService.registerFirm({ ...formData, turnstile_token: turnstileToken || undefined })
      
      if (result.success) {
        // Set redirecting flag to prevent auth redirect interference
        setIsRedirecting(true)
        
        // Store email for verification page FIRST
        console.log('[Register] Storing verification email:', formData.adminEmail)
        localStorage.setItem('verification_email', formData.adminEmail)
        localStorage.setItem('verification_tag', 'registration-verification')
        
        // Verify they were stored
        console.log('[Register] Stored email verification:', localStorage.getItem('verification_email'))
        console.log('[Register] Stored tag verification:', localStorage.getItem('verification_tag'))
        
        // Store tokens for later use after verification (but don't set as active session yet)
        if (result.tokens) {
          localStorage.setItem('pending_tokens', JSON.stringify({
            tokens: result.tokens,
            user: result.user,
            lastActivity: Date.now()
          }))
          console.log('[Register] Stored pending tokens')
        }
        
        // Show success toast
        toast({
          variant: "success",
          title: "Account Created Successfully!",
          description: "Please check your email for verification code. Redirecting to verification page...",
        })
        
        // Redirect to verification page after 3 seconds
        setTimeout(() => {
          console.log('[Register] About to redirect to /verify-email')
          console.log('[Register] Final localStorage check:', {
            email: localStorage.getItem('verification_email'),
            tag: localStorage.getItem('verification_tag')
          })
          router.push("/verify-email")
        }, 3000)
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">LawCentrAI</span>
          </div>
          <CardTitle className="text-2xl">Register Your Law Firm</CardTitle>
          <CardDescription>Set up your firm account and start managing cases with AI assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firmName">Firm Name *</Label>
                <Input
                  id="firmName"
                  value={formData.firmName}
                  onChange={(e) => handleInputChange("firmName", e.target.value)}
                  placeholder="Smith & Associates Law Firm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Primary Jurisdiction *</Label>
                <Select onValueChange={(value) => handleInputChange("jurisdiction", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Administrator Name *</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange("adminName", e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Administrator Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                  placeholder="john@smithlaw.com"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmAddress">Firm Address</Label>
              <Textarea
                id="firmAddress"
                value={formData.firmAddress}
                onChange={(e) => handleInputChange("firmAddress", e.target.value)}
                placeholder="123 Legal Street, Law City, LC 12345"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="practiceAreas">Practice Areas</Label>
                <Input
                  id="practiceAreas"
                  value={formData.practiceAreas}
                  onChange={(e) => handleInputChange("practiceAreas", e.target.value)}
                  placeholder="Corporate, Criminal, Civil"
                />
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting || (process.env.NODE_ENV === 'production' && !turnstileToken)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Firm Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
