"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { useInactivityTimer } from '@/hooks/use-inactivity-timer'
import { InactivityWarningDialog } from '@/components/inactivity-warning-dialog'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string[]
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requireRole = [], 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const { showWarning, countdown, dismissWarning } = useInactivityTimer()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the current URL to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      sessionStorage.setItem('redirectAfterLogin', currentPath)
      
      // Add redirect parameter to login URL
      const redirectParam = encodeURIComponent(currentPath)
      router.push(`${fallbackPath}?redirect=${redirectParam}`)
    }
  }, [isAuthenticated, isLoading, router, fallbackPath])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && requireRole.length > 0) {
      if (!requireRole.includes(user.role)) {
        // User doesn't have required role, redirect to dashboard or unauthorized page
        router.push('/dashboard?error=unauthorized')
      }
    }
  }, [isAuthenticated, isLoading, user, requireRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      {children}
      <InactivityWarningDialog 
        open={showWarning}
        countdown={countdown}
        onDismiss={dismissWarning}
      />
    </>
  )
}

export default ProtectedRoute