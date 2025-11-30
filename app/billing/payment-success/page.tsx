"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"
import { useBilling } from "@/contexts/billing-context"
import { useToast } from "@/lib/use-toast"
import Link from 'next/link'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyPayment, refreshStatus } = useBilling()
  const { toast } = useToast()
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    const redirect = searchParams.get('redirect')
    
    if (!reference) {
      setVerificationStatus('failed')
      setErrorMessage('Payment reference not found')
      return
    }

    const verifyPaymentStatus = async () => {
      try {
        const result = await verifyPayment(reference)
        
        if (result.success && result.verified) {
          setVerificationStatus('success')
          toast({
            variant: "success",
            title: "Payment Successful!",
            description: "Your subscription has been upgraded successfully.",
          })
          
          // Refresh subscription status
          await refreshStatus()
          
          // Auto-redirect to settings if requested
          if (redirect === 'settings') {
            setTimeout(() => {
              router.push('/settings?tab=billing')
            }, 3000)
          }
        } else {
          setVerificationStatus('failed')
          setErrorMessage(result.error || 'Payment verification failed')
        }
      } catch (error: any) {
        setVerificationStatus('failed')
        setErrorMessage(error.message || 'An unexpected error occurred')
      }
    }

    verifyPaymentStatus()
  }, [searchParams, verifyPayment, refreshStatus, toast, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verificationStatus === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle className="text-green-900">Payment Successful!</CardTitle>
              <CardDescription>
                Your subscription has been upgraded successfully.
                {searchParams.get('redirect') === 'settings' && (
                  <div className="mt-2 text-sm text-blue-600">
                    Redirecting to settings in 3 seconds...
                  </div>
                )}
              </CardDescription>
            </>
          )}
          
          {verificationStatus === 'failed' && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <CardTitle className="text-red-900">Payment Failed</CardTitle>
              <CardDescription>There was an issue with your payment.</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {verificationStatus === 'failed' && errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Create unlimited cases</li>
                  <li>• Invite team members</li>
                  <li>• Unlimited AI chat messages</li>
                  <li>• Access all premium features</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/settings?tab=billing" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {verificationStatus === 'failed' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">What can you do?</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Try the payment again</li>
                  <li>• Check your payment method</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Link href="/billing" className="flex-1">
                  <Button className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
