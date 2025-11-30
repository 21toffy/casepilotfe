"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Building2, Mail, User } from "lucide-react"
import { getApiClient, extractErrorMessage } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface InvitationData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  firm_name: string
  case_title?: string
  case_id?: number
  invited_by: string
  message: string
  expires_at: string
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone_number: '',
  })

  useEffect(() => {
    loadInvitation()
  }, [params.token])

  const loadInvitation = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiClient = getApiClient()
      // Try case invitation first, then org invitation
      let response = await apiClient.get(`/api/users/invitations/case-invite/${params.token}/`)
      
      if (!response.data && response.error) {
        // Try org invitation
        response = await apiClient.get(`/api/users/invitations/${params.token}/`)
      }
      
      if (response.data && response.data.invitation) {
        setInvitation(response.data.invitation)
      } else {
        setError("Invitation not found or has expired.")
      }
    } catch (err: any) {
      console.error("Failed to load invitation:", err)
      const errorMessage = extractErrorMessage(err.response?.data || err)
      setError(errorMessage || "Failed to load invitation details.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    setIsSubmitting(true)
    
    try {
      const apiClient = getApiClient()
      
      // Determine if it's a case or org invitation
      const isCaseInvitation = invitation?.case_id !== undefined
      const endpoint = isCaseInvitation
        ? `/api/users/invitations/case-invite/${params.token}/accept/`
        : `/api/users/invitations/${params.token}/accept/`
      
      const response = await apiClient.post(endpoint, {})
      
      if (response.data) {
        toast({
          title: "Success!",
          description: isCaseInvitation 
            ? "You've been added to the case successfully."
            : "You've joined the organization successfully.",
        })
        
        // Redirect to appropriate page after 1 second
        setTimeout(() => {
          if (isCaseInvitation && response.data.case_id) {
            router.push(`/cases/${response.data.case_id}`)
          } else {
            router.push('/dashboard')
          }
        }, 1000)
      } else if (response.error) {
        const errorMessage = extractErrorMessage(response.error)
        toast({
          variant: "destructive",
          title: "Acceptance Failed",
          description: errorMessage,
        })
      } else {
        throw new Error("Failed to accept invitation.")
      }
    } catch (err: any) {
      console.error("Failed to accept invitation:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <CardTitle>Invitation Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || "This invitation link is invalid or has expired."}
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle>Accept Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join {invitation.firm_name}
            {invitation.case_title && ` on case: ${invitation.case_title}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{invitation.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Invited by: {invitation.invited_by}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Role: {invitation.role.replace('_', ' ')}</span>
            </div>
            {invitation.message && (
              <Alert>
                <AlertDescription className="text-sm">
                  {invitation.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              You are already a member of this organization. Click below to accept this invitation and gain access to {invitation.case_title ? 'the case' : 'additional permissions'}.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleAccept} 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You must be logged in to accept this invitation. Please <a href="/login" className="text-blue-600 underline">login</a> if you haven't already.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

