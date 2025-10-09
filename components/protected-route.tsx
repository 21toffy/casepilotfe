"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath)
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

  return <>{children}</>
}

export default ProtectedRoute