"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  Check, 
  X, 
  Crown, 
  Users, 
  MessageSquare, 
  FolderOpen,
  Calendar,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { useBilling } from "@/contexts/billing-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/lib/use-toast"

export default function BillingPage() {
  const { user } = useAuth()
  const { 
    subscriptionStatus, 
    availablePlans, 
    isLoading, 
    error, 
    initiatePayment,
    refreshStatus 
  } = useBilling()
  const { toast } = useToast()
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  const handleUpgrade = async (planCode: string) => {
    if (!user?.is_super_user_role()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only firm administrators can manage subscriptions.",
      })
      return
    }

    setProcessingPayment(planCode)

    try {
      const result = await initiatePayment(planCode)
      
      if (result.success && result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl
      } else {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: result.error || "Failed to initiate payment",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setProcessingPayment(null)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your LawCentrAI subscription and usage</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      {subscriptionStatus && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscriptionStatus.plan_code === 'professional' && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                  {subscriptionStatus.plan_name}
                </CardTitle>
                <CardDescription>
                  Status: <Badge variant={subscriptionStatus.is_active ? "default" : "destructive"}>
                    {subscriptionStatus.status}
                  </Badge>
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={refreshStatus}
                disabled={isLoading}
              >
                Refresh Status
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cases Usage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-medium">Cases</span>
                </div>
                <div className="text-sm text-gray-600">
                  {subscriptionStatus.current_counts.total_cases} / {formatLimit(subscriptionStatus.limits.max_cases)}
                </div>
                {subscriptionStatus.limits.max_cases !== -1 && (
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionStatus.current_counts.total_cases, 
                      subscriptionStatus.limits.max_cases
                    )} 
                    className="h-2"
                  />
                )}
              </div>

              {/* Users Usage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Team Members</span>
                </div>
                <div className="text-sm text-gray-600">
                  {subscriptionStatus.current_counts.total_users} / {formatLimit(subscriptionStatus.limits.max_users)}
                </div>
                {subscriptionStatus.limits.max_users !== -1 && (
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionStatus.current_counts.total_users, 
                      subscriptionStatus.limits.max_users
                    )} 
                    className="h-2"
                  />
                )}
              </div>

              {/* Chat Usage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Daily Chats</span>
                </div>
                <div className="text-sm text-gray-600">
                  {subscriptionStatus.usage_today.chat_messages_sent} / {formatLimit(subscriptionStatus.limits.daily_chat_limit)} today
                </div>
                {subscriptionStatus.limits.daily_chat_limit !== -1 && (
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionStatus.usage_today.chat_messages_sent, 
                      subscriptionStatus.limits.daily_chat_limit
                    )} 
                    className="h-2"
                  />
                )}
              </div>
            </div>

            {subscriptionStatus.expires_at && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {subscriptionStatus.days_until_expiry !== null && subscriptionStatus.days_until_expiry > 0
                      ? `Expires in ${subscriptionStatus.days_until_expiry} days`
                      : 'Subscription expired'
                    }
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                subscriptionStatus?.plan_code === plan.plan_code 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
              }`}
            >
              {subscriptionStatus?.plan_code === plan.plan_code && (
                <Badge className="absolute -top-2 -right-2">Current Plan</Badge>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {plan.plan_code === 'professional' && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₦{plan.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">/{plan.billing_cycle}</div>
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {plan.max_cases === -1 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-sm font-medium w-4">{plan.max_cases}</span>
                    )}
                    <span className="text-sm">
                      {plan.max_cases === -1 ? 'Unlimited cases' : `${plan.max_cases} case${plan.max_cases === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {plan.can_invite_users ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {plan.can_invite_users ? 'Team collaboration' : 'No team collaboration'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {plan.daily_chat_limit === -1 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-sm font-medium w-4">{plan.daily_chat_limit}</span>
                    )}
                    <span className="text-sm">
                      {plan.daily_chat_limit === -1 
                        ? 'Unlimited AI chats' 
                        : `${plan.daily_chat_limit} AI chats per day`
                      }
                    </span>
                  </div>
                </div>

                {subscriptionStatus?.plan_code !== plan.plan_code && (
                  <Button 
                    className="w-full mt-6" 
                    onClick={() => handleUpgrade(plan.plan_code)}
                    disabled={processingPayment === plan.plan_code || !user?.is_super_user_role()}
                  >
                    {processingPayment === plan.plan_code ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                      </>
                    )}
                  </Button>
                )}

                {!user?.is_super_user_role() && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Only firm administrators can manage subscriptions
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}





