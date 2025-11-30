"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

interface StorageUsage {
  total_storage_mb: number
  storage_limit_mb: number
  storage_usage_percentage: number
  is_over_limit: boolean
  is_near_limit: boolean
  remaining_storage_mb: number
  document_storage_mb: number
  submission_storage_mb: number
  invoice_storage_mb: number
}

interface SubscriptionPlan {
  id: number
  name: string
  plan_code: string
  description: string
  price: number
  currency: string
  billing_cycle: string
  max_cases: number
  max_users: number
  daily_chat_limit: number
  can_invite_users: boolean
}

interface SubscriptionStatus {
  plan_name: string
  plan_code: string
  status: string
  is_active: boolean
  expires_at: string | null
  days_until_expiry: number | null
  limits: {
    max_cases: number
    max_users: number
    daily_chat_limit: number
    can_invite_users: boolean
  }
  usage_today: {
    cases_created: number
    chat_messages_sent: number
    users_invited: number
  }
  current_counts: {
    total_cases: number
    total_users: number
  }
  storage: StorageUsage
}

interface BillingContextType {
  subscriptionStatus: SubscriptionStatus | null
  availablePlans: SubscriptionPlan[]
  isLoading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  initiatePayment: (planCode: string) => Promise<{ success: boolean; authorizationUrl?: string; error?: string }>
  verifyPayment: (reference: string) => Promise<{ success: boolean; verified?: boolean; error?: string }>
  canCreateCase: () => { allowed: boolean; reason?: string }
  canInviteUser: () => { allowed: boolean; reason?: string }
  canSendChat: () => { allowed: boolean; reason?: string }
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export function useBilling() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider')
  }
  return context
}

interface BillingProviderProps {
  children: ReactNode
}

export function BillingProvider({ children }: BillingProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    // Use the proper API client instead of direct fetch
    const { getApiClient } = await import('@/lib/api-client')
    const apiClient = getApiClient()
    
    const method = (options.method || 'GET').toLowerCase()
    const fullEndpoint = `/api/billing${endpoint}`
    
    let response
    if (method === 'get') {
      response = await apiClient.get(fullEndpoint)
    } else if (method === 'post') {
      const body = options.body ? JSON.parse(options.body as string) : undefined
      response = await apiClient.post(fullEndpoint, body)
    } else if (method === 'put') {
      const body = options.body ? JSON.parse(options.body as string) : undefined
      response = await apiClient.put(fullEndpoint, body)
    } else if (method === 'delete') {
      response = await apiClient.delete(fullEndpoint)
    } else {
      response = await apiClient.get(fullEndpoint)
    }

    if (response.error) {
      throw new Error(response.error.error || response.error.message || 'Request failed')
    }

    return response.data
  }

  const refreshStatus = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch subscription status
      const statusResponse = await apiCall('/status/')
      setSubscriptionStatus(statusResponse)

      // Fetch available plans
      const plansResponse = await apiCall('/plans/')
      setAvailablePlans(plansResponse.plans || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch billing data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const initiatePayment = async (planCode: string) => {
    try {
      setError(null)
      const response = await apiCall('/payment/initiate/', {
        method: 'POST',
        body: JSON.stringify({
          plan_code: planCode,
          callback_url: `${window.location.origin}/billing/payment-success`,
        }),
      })

      return {
        success: true,
        authorizationUrl: response.authorization_url,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      }
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      setError(null)
      const response = await apiCall('/payment/verify/', {
        method: 'POST',
        body: JSON.stringify({ reference }),
      })

      // Refresh status after successful payment
      if (response.verified) {
        await refreshStatus()
      }

      return {
        success: true,
        verified: response.verified,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      }
    }
  }

  const canCreateCase = () => {
    if (!subscriptionStatus) {
      return { allowed: false, reason: 'Subscription status not loaded' }
    }

    if (!subscriptionStatus.is_active) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    const { max_cases } = subscriptionStatus.limits
    const { total_cases } = subscriptionStatus.current_counts

    if (max_cases === -1) {
      return { allowed: true } // Unlimited
    }

    if (total_cases >= max_cases) {
      return { 
        allowed: false, 
        reason: `You have reached your case limit (${max_cases}). Upgrade to create more cases.` 
      }
    }

    return { allowed: true }
  }

  const canInviteUser = () => {
    if (!subscriptionStatus) {
      return { allowed: false, reason: 'Subscription status not loaded' }
    }

    if (!subscriptionStatus.is_active) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    if (!subscriptionStatus.limits.can_invite_users) {
      return { 
        allowed: false, 
        reason: 'User invitations are not available on your current plan' 
      }
    }

    const { max_users } = subscriptionStatus.limits
    const { total_users } = subscriptionStatus.current_counts

    if (max_users === -1) {
      return { allowed: true } // Unlimited
    }

    if (total_users >= max_users) {
      return { 
        allowed: false, 
        reason: `You have reached your user limit (${max_users}). Upgrade to invite more users.` 
      }
    }

    return { allowed: true }
  }

  const canSendChat = () => {
    if (!subscriptionStatus) {
      return { allowed: false, reason: 'Subscription status not loaded' }
    }

    if (!subscriptionStatus.is_active) {
      return { allowed: false, reason: 'Your subscription is not active' }
    }

    const { daily_chat_limit } = subscriptionStatus.limits
    const { chat_messages_sent } = subscriptionStatus.usage_today

    if (daily_chat_limit === -1) {
      return { allowed: true } // Unlimited
    }

    if (chat_messages_sent >= daily_chat_limit) {
      return { 
        allowed: false, 
        reason: `You have reached your daily chat limit (${daily_chat_limit}). Upgrade for unlimited chats.` 
      }
    }

    return { allowed: true }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshStatus()
    }
  }, [isAuthenticated, user])

  const value: BillingContextType = {
    subscriptionStatus,
    availablePlans,
    isLoading,
    error,
    refreshStatus,
    initiatePayment,
    verifyPayment,
    canCreateCase,
    canInviteUser,
    canSendChat,
  }

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  )
}
